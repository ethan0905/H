# Testing Worldcoin Authentication - Step by Step Guide

## Prerequisites
- World App installed on your mobile device
- Your World ID verified with an Orb (required!)
- H World app deployed and accessible

## Test Scenario 1: First Time User (In World App)

### Steps:
1. **Open H World in World App**
   - Navigate to your H World mini app in World App
   - App should start loading

2. **Observe Auto-Authentication**
   - Watch for "Authenticating..." message
   - Should happen automatically without clicking anything
   - Loading spinner should appear

3. **Expected Behavior:**
   - ✅ Authentication completes within 2-3 seconds
   - ✅ "Authenticated! Welcome to H World" message appears briefly
   - ✅ App redirects to home feed automatically
   - ✅ User can see their profile with wallet address

4. **If Authentication Fails:**
   - ❌ Check if you're orb-verified (must have visited an Orb location)
   - ❌ Error message will say: "Orb verification required..."
   - ❌ Contact World ID support to complete orb verification

## Test Scenario 2: Returning User (In World App)

### Steps:
1. **Close and Reopen App**
   - Force close World App
   - Navigate back to H World

2. **Observe Behavior:**
   - ✅ Should show "Restoring session..." briefly
   - ✅ Previous session loaded from localStorage
   - ✅ User is already authenticated
   - ✅ Home feed appears immediately

3. **No Re-Authentication Needed:**
   - Authentication state persists across app sessions
   - Only need to re-auth after logout

## Test Scenario 3: Logout Flow

### Steps:
1. **Navigate to Profile Tab**
   - Click profile icon in bottom navigation (mobile)
   - Or click profile in sidebar (desktop)

2. **Locate Logout Button**
   - Scroll down past profile info
   - Below "Followers" and "Following" stats
   - Red button with logout icon

3. **Click Logout**
   - Confirmation dialog appears: "Are you sure you want to logout?"
   - Click "OK" to confirm

4. **Observe Redirect:**
   - ✅ Immediately redirected to login screen
   - ✅ Welcome screen with "Sign in with Worldcoin" button
   - ✅ Authentication state cleared

5. **Verify Logout:**
   - Close browser dev tools and check localStorage
   - Should be empty or not contain user data

## Test Scenario 4: Re-Authentication After Logout

### Steps:
1. **After Logging Out**
   - Should be on welcome/login screen
   - See "Sign in with Worldcoin" button

2. **Auto-Auth Should Trigger**
   - In World App, authentication should start automatically
   - No need to click the button manually

3. **Sign Message in World App**
   - World App will show signature request
   - Message: "Sign in to H World - Verified human social network powered by World ID"
   - Approve the signature

4. **Expected Behavior:**
   - ✅ Signature accepted
   - ✅ Backend verifies signature
   - ✅ Orb verification checked
   - ✅ User logged back in
   - ✅ Redirected to home feed

## Test Scenario 5: Device Verification User (Should Fail)

### Steps:
1. **User with Device Verification Only**
   - If you only have device verification (not orb)
   - Open app in World App

2. **Authentication Attempt:**
   - Auto-auth will trigger
   - Signature will be signed
   - Backend verification will run

3. **Expected Behavior:**
   - ❌ Error message appears
   - ❌ "Orb verification required..."
   - ❌ User cannot access app
   - ❌ Clear message to visit Orb location

4. **This is Correct:**
   - H World requires orb verification
   - Device verification is insufficient
   - User must visit physical Orb location

## Test Scenario 6: Outside World App (Regular Browser)

### Steps:
1. **Open H World in Chrome/Safari**
   - Navigate to H World URL
   - Should load login screen

2. **Click "Sign in with Worldcoin"**
   - Button text should say "Open in World App to Continue"
   - Error message appears if clicked

3. **Expected Behavior:**
   - ❌ "Please open this app in World App to continue"
   - ❌ Cannot authenticate outside World App
   - ❌ No workaround available

4. **Development Workaround:**
   - In dev mode: Click "Continue as Guest"
   - Browse seeded data without authentication
   - For testing UI only

## Test Scenario 7: Network Error Handling

### Steps:
1. **Simulate Network Issues**
   - Turn on airplane mode during auth
   - Or use browser dev tools to throttle/block network

2. **Attempt Authentication:**
   - Auto-auth will fail
   - Error message should appear

3. **Expected Behavior:**
   - ✅ Clear error message displayed
   - ✅ "Dismiss" button available
   - ✅ Can retry by refreshing page
   - ✅ No crash or infinite loading

## Test Scenario 8: Multiple Sessions

### Steps:
1. **Login on Device A**
   - Complete authentication
   - Navigate around app

2. **Login on Device B (Same User)**
   - Open app on second device
   - Authenticate with same World ID

3. **Expected Behavior:**
   - ✅ Both sessions work independently
   - ✅ Same wallet address on both
   - ✅ Actions on one device don't affect other
   - Note: Real-time sync not implemented yet

## Checking Console Logs

### In World App or Browser Dev Tools:

1. **Open Console:**
   - In World App: Enable debug mode
   - In browser: Press F12 or Cmd+Option+I

2. **Look for These Logs:**
   ```
   🚀 H WORLD APP STARTING
   🔐 Auto-authenticating with Worldcoin wallet...
   ✅ Nonce generated: [nonce]
   ✅ Wallet signature received
   📤 Sending wallet auth to backend for verification...
   🔐 Verifying wallet auth for address: [address]
   ✅ Signature verified successfully
   ✅ User is orb-verified
   ✅ Wallet auth verified successfully
   ✅ Authentication complete!
   ✅ Auto-auth successful: [user object]
   ```

3. **Error Logs to Watch For:**
   ```
   ❌ User is not orb-verified
   ❌ Invalid signature
   ❌ Wallet authentication failed
   ❌ MiniKit is not installed
   ```

## Troubleshooting

### Problem: "MiniKit is not installed"
**Solution:** 
- Must use World App
- Cannot test in regular browser
- Use development guest mode for UI testing

### Problem: "Orb verification required"
**Solution:**
- Visit a World ID Orb location
- Complete in-person verification
- Only orb verification is accepted
- Find Orbs: https://worldcoin.org/find-orb

### Problem: "Authentication failed"
**Solution:**
- Check network connection
- Verify environment variables are set
- Check backend logs for detailed error
- Try logging out and back in

### Problem: Stuck on loading screen
**Solution:**
- Wait 5 seconds for hydration
- Check browser console for errors
- Refresh page
- Clear localStorage and try again

### Problem: Logout doesn't work
**Solution:**
- Check browser console for errors
- Verify `logout()` function in userStore
- Clear localStorage manually if needed
- Force refresh after logout

## Success Criteria

✅ **Authentication Works:**
- Auto-auth triggers on app open in World App
- Only orb-verified users can access
- Non-orb users see clear error message

✅ **Logout Works:**
- Logout button visible in profile
- Confirmation dialog appears
- User redirected to login screen
- State cleared properly

✅ **User Experience:**
- No manual login button clicks needed
- Smooth loading states
- Clear error messages
- Fast authentication (< 5 seconds)

✅ **Security:**
- Nonce generated on backend
- Signature verified properly
- Orb verification enforced
- Session persists correctly

## Testing Checklist

- [ ] First time user can authenticate in World App
- [ ] Returning user session persists
- [ ] Logout button appears in profile
- [ ] Logout confirmation dialog works
- [ ] User redirected after logout
- [ ] Re-authentication works after logout
- [ ] Device-verified users are rejected
- [ ] Non-World App users see appropriate message
- [ ] Network errors handled gracefully
- [ ] No TypeScript errors in console
- [ ] No React errors in console
- [ ] Loading states appear and disappear correctly
- [ ] Success messages show briefly

## Next Steps After Testing

1. **If All Tests Pass:**
   - Deploy to production
   - Monitor authentication metrics
   - Gather user feedback

2. **If Tests Fail:**
   - Check console logs for errors
   - Review error messages
   - Verify environment variables
   - Test backend endpoints independently
   - Contact World ID support if needed

3. **Performance Monitoring:**
   - Track authentication success rate
   - Monitor average auth time
   - Log failed authentication attempts
   - Analyze orb vs device verification attempts

## Support Resources

- World ID Documentation: https://docs.world.org
- MiniKit GitHub: https://github.com/worldcoin/minikit-js
- Find an Orb: https://worldcoin.org/find-orb
- World ID Discord: https://world.org/discord

---

**Happy Testing! 🌍✨**

Remember: Only orb-verified humans can access H World. This is by design to ensure a bot-free, verified human community!
