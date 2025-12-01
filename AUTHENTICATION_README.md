# H World - Worldcoin Authentication Setup

## Quick Start

This app uses **Worldcoin Wallet Authentication** to ensure only orb-verified humans can access the platform.

### For Users
1. **Open H World in World App** (required)
2. **Authentication happens automatically** - no button click needed
3. **Approve the signature** when prompted
4. **Start using H World!**

### For Developers
All the code is implemented and ready. Just test in World App with an orb-verified account.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Opens App                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │   AuthButton Component            │
        │   (Auto-triggers in World App)    │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │   lib/worldAuth.ts                │
        │   authenticateWithWallet()        │
        └───────────────┬───────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
        ▼                                ▼
┌───────────────────┐      ┌────────────────────────┐
│ GET /api/nonce    │      │ MiniKit.walletAuth()   │
│ Generate nonce    │      │ User signs message     │
└───────────┬───────┘      └───────────┬────────────┘
            │                          │
            └────────┬─────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ POST /api/verify-wallet-auth   │
        │ - Verify signature             │
        │ - Check orb verification       │
        │ - Create/return user           │
        └────────────┬───────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
┌──────────────┐          ┌────────────────┐
│ Orb Verified │          │ Not Orb        │
│ ✅ Login     │          │ ❌ Reject      │
└──────────────┘          └────────────────┘
```

## File Structure

### Frontend Components
```
src/
├── components/
│   ├── auth/
│   │   └── AuthButton.tsx          # Auto-triggers wallet auth
│   └── user/
│       └── UserProfile.tsx         # Has logout button
│
├── store/
│   └── userStore.ts                # User state + logout()
│
├── lib/
│   └── worldAuth.ts                # Authentication logic
│
├── types/
│   └── index.ts                    # User interface with verification fields
│
└── app/
    └── page.tsx                    # Main page with auth check
```

### Backend API Routes
```
src/app/api/
├── nonce/
│   └── route.ts                    # Generate secure nonces
│
└── verify-wallet-auth/
    └── route.ts                    # Verify signatures & check orb status
```

## Code Highlights

### 1. Auto-Authentication (AuthButton.tsx)
```typescript
useEffect(() => {
  const autoAuth = async () => {
    if (!MiniKit.isInstalled()) return;
    
    const result = await authenticateWithWallet();
    
    if (result.success && result.user.verificationLevel === 'orb') {
      setUser(result.user);
      setWorldIdVerification({ verified: true, ... });
    } else {
      setLocalError('Orb verification required');
    }
  };
  
  autoAuth();
}, []);
```

### 2. Wallet Auth Flow (worldAuth.ts)
```typescript
export async function authenticateWithWallet() {
  // 1. Generate nonce from backend
  const nonce = await generateNonce();
  
  // 2. Call MiniKit wallet auth
  const authResult = await initiateWalletAuth({ nonce, ... });
  
  // 3. Verify signature on backend
  const verificationResult = await verifyWalletAuth(authResult.payload);
  
  return verificationResult;
}
```

### 3. Backend Verification (verify-wallet-auth/route.ts)
```typescript
export async function POST(request: NextRequest) {
  const { address, message, signature, nonce } = await request.json();
  
  // Verify SIWE signature
  const validationResult = await verifySiweMessage({...});
  
  if (!validationResult.isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // Check orb verification
  if (verificationLevel !== 'orb') {
    return NextResponse.json({
      error: 'Orb verification required'
    }, { status: 403 });
  }
  
  // Create user and return
  return NextResponse.json({ success: true, user: userData });
}
```

### 4. Logout (UserProfile.tsx)
```typescript
const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    logout(); // Clears state
    // page.tsx will redirect to login
  }
};

// Render
<button onClick={handleLogout}>
  <LogOut /> Logout
</button>
```

## Environment Variables

Make sure these are set:

```env
# .env.local
NEXT_PUBLIC_MINIKIT_APP_ID=your_minikit_app_id
NEXT_PUBLIC_WORLD_ID_ACTION=sign-in
NODE_ENV=development
```

## Testing Checklist

### ✅ Pre-Testing
- [ ] World App installed on device
- [ ] User has orb verification (not just device)
- [ ] Environment variables configured
- [ ] App deployed or running locally

### ✅ Authentication Flow
- [ ] Open app in World App
- [ ] Auto-authentication triggers
- [ ] Signature prompt appears
- [ ] After approval, user is logged in
- [ ] Home feed loads correctly

### ✅ Orb Verification
- [ ] Orb-verified users can access ✅
- [ ] Device-verified users see error ❌
- [ ] Error message is clear and helpful

### ✅ Logout Flow
- [ ] Navigate to profile tab
- [ ] Logout button is visible
- [ ] Click logout
- [ ] Confirmation dialog appears
- [ ] After confirming, redirected to login
- [ ] State is cleared properly

### ✅ Re-Authentication
- [ ] After logout, can login again
- [ ] Auto-auth triggers on app reopen
- [ ] Session persists between closes

## Common Issues & Solutions

### Issue: "MiniKit is not installed"
**Cause:** Not using World App  
**Solution:** Open the app in World App, not a regular browser

### Issue: "Orb verification required"
**Cause:** User only has device verification  
**Solution:** Visit a World ID Orb location to get orb verified

### Issue: Authentication stuck
**Cause:** Network issue or backend error  
**Solution:** Check console logs, verify backend is running, check network connection

### Issue: Logout doesn't redirect
**Cause:** React state not updating  
**Solution:** Refresh page, check page.tsx auth logic

## Production Considerations

### Security Enhancements
1. **Database Storage**
   - Store nonces in database
   - Track nonce usage to prevent replay attacks
   - Add rate limiting

2. **Session Management**
   - Implement JWT tokens
   - Add refresh token rotation
   - Set session timeout

3. **Monitoring**
   - Log authentication attempts
   - Track success/failure rates
   - Alert on suspicious activity

### User Experience
1. **Error Handling**
   - More detailed error messages
   - Retry mechanisms
   - Support contact info

2. **Performance**
   - Cache verification results
   - Optimize signature verification
   - Reduce bundle size

3. **Analytics**
   - Track authentication funnel
   - Monitor conversion rates
   - Identify drop-off points

## API Reference

### GET /api/nonce
Generates a cryptographically secure nonce for authentication.

**Response:**
```json
{
  "nonce": "hex_string_64_chars",
  "expiresAt": "2025-12-01T12:05:00.000Z"
}
```

### POST /api/verify-wallet-auth
Verifies wallet authentication signature and checks orb status.

**Request:**
```json
{
  "address": "0x...",
  "message": "Sign in to H World...",
  "signature": "0x...",
  "nonce": "hex_string_64_chars"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_...",
    "walletAddress": "0x...",
    "username": "user_...",
    "verificationLevel": "orb",
    "verified": true,
    ...
  }
}
```

**Error Response (403):**
```json
{
  "error": "Orb verification required",
  "verificationLevel": "device",
  "message": "You must be verified with a World ID Orb..."
}
```

## Resources

- **World ID Wallet Auth Docs:** https://docs.world.org/mini-apps/commands/wallet-auth
- **MiniKit GitHub:** https://github.com/worldcoin/minikit-js
- **Find an Orb:** https://worldcoin.org/find-orb
- **SIWE Spec:** https://eips.ethereum.org/EIPS/eip-4361

## Documentation Files

- **`AUTH_IMPLEMENTATION_SUMMARY.md`** - Quick overview of what's implemented
- **`WORLDCOIN_AUTH_IMPLEMENTATION.md`** - Detailed technical documentation
- **`TESTING_AUTH_GUIDE.md`** - Step-by-step testing instructions

## Support

If you encounter issues:

1. **Check console logs** - Detailed error messages logged
2. **Verify orb status** - Must have orb verification
3. **Test in World App** - Required for authentication
4. **Review documentation** - See files listed above

## Summary

✅ **Authentication:** Worldcoin wallet auth with auto-trigger  
✅ **Verification:** Orb-verified humans only  
✅ **Security:** Nonce-based with signature verification  
✅ **User Experience:** Automatic login, smooth flow  
✅ **Logout:** Button in profile with confirmation  
✅ **Type Safety:** Full TypeScript support  
✅ **Documentation:** Comprehensive guides included  

**Ready to test! 🚀**

Open in World App with an orb-verified account and watch the magic happen! ✨
