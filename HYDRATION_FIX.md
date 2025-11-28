# Hydration & Loading Issues Fix

## Problem
The app was getting stuck on the loading screen on mobile, showing infinite loading spinner.

## Root Cause
**Zustand persist middleware** was trying to access `localStorage` during Server-Side Rendering (SSR), causing hydration issues. This is a common problem with Next.js App Router and client-side state management.

## Solution Implemented

### 1. Fixed Store Hydration (`src/store/userStore.ts`)
- Added `_hasHydrated` state to track when store is ready
- Added `createJSONStorage` with SSR-safe storage
- Added `onRehydrateStorage` callback to set hydration flag
- Added no-op storage for SSR (returns null during server render)
- Added logging to `setUser`, `setWorldIdVerification`, and `logout`

### 2. Fixed Page Rendering (`src/app/page.tsx`)
- Wait for BOTH `isClient` AND `_hasHydrated` before showing content
- Added 2-second timeout fallback for hydration
- Better loading messages:
  - "Loading H World..." - Initial mount
  - "Restoring session..." - Waiting for hydration
  - "Starting fresh session" - Hydration timeout
- Added debug logging for loading states

## How It Works

### Normal Flow:
1. **SSR Phase**: Store uses no-op storage (returns null)
2. **Client Mount**: `isClient` becomes `true`
3. **Hydration**: Zustand reads from localStorage
4. **Hydration Complete**: `_hasHydrated` becomes `true`
5. **App Renders**: Show login or main app

### Timeout Flow (if hydration hangs):
1. Steps 1-2 same as above
2. **2 Second Wait**: Hydration doesn't complete
3. **Force Hydration**: Set `_hasHydrated = true`
4. **App Renders**: Show login screen (fresh session)

## Testing Instructions

### 1. Clear State (Clean Test)
```javascript
// In browser console or Eruda:
localStorage.removeItem('user-storage');
location.reload();
```

### 2. Watch Loading Sequence
Look for these logs in order:
```
🚀 H WORLD APP STARTING
...
✅ App mounted successfully
🔹 Hydration finished, state: {...}
```

### 3. Test Fresh Session
- Clear localStorage
- Reload page
- Should show login screen within 2 seconds

### 4. Test Returning User
- Login with World ID
- Close and reopen app
- Should restore session and show feed immediately

### 5. Test Hydration Timeout
- If stuck >2 seconds, should auto-recover
- Check for "⚠️ Hydration timeout" warning in console

## Debug Commands

### Check Current State
```javascript
// In Eruda console:
console.log('Store state:', useUserStore.getState());
console.log('Has hydrated:', useUserStore.getState()._hasHydrated);
console.log('Is authenticated:', useUserStore.getState().isAuthenticated);
console.log('User:', useUserStore.getState().user);
```

### Force Hydration
```javascript
// If stuck, force hydration:
useUserStore.getState().setHasHydrated(true);
```

### Clear and Reset
```javascript
// Nuclear option - clear everything:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Common Issues & Solutions

### Issue 1: Still Stuck Loading
**Symptoms**: Spinner forever, no logs after "App mounted"
**Solution**: 
- Check if there's a JavaScript error before hydration
- Look for red errors in Eruda console
- Try: `localStorage.removeItem('user-storage')`

### Issue 2: User Not Persisting
**Symptoms**: Login works but refresh logs you out
**Solution**:
- Check localStorage is enabled in browser
- Check console for storage errors
- Verify `user-storage` key exists in localStorage

### Issue 3: Hydration Takes Forever
**Symptoms**: Stuck on "Restoring session..." for >5 seconds
**Solution**:
- The 2-second timeout should kick in automatically
- If not, there may be a deeper issue
- Check for console errors related to JSON parsing

### Issue 4: Double Render / Flash
**Symptoms**: See login screen briefly then feed, or vice versa
**Solution**:
- This is expected during hydration
- Should be minimal (<100ms)
- If longer, may need to adjust timing

## Files Modified

- ✅ `src/store/userStore.ts` - Added hydration tracking
- ✅ `src/app/page.tsx` - Added hydration wait logic

## Verification Checklist

- [ ] App loads without infinite spinner
- [ ] Login with World ID succeeds
- [ ] User state persists after refresh
- [ ] No hydration warnings in console
- [ ] Loading screen shows <2 seconds
- [ ] Timeout fallback works if needed

## Next Steps

1. Test on actual mobile device in World App
2. Verify ngrok tunnel still works
3. Complete World ID verification flow
4. Test persistence after app close/reopen

## Related Documentation

- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [Next.js Hydration](https://nextjs.org/docs/messages/react-hydration-error)
- [SSR-Safe State Management](https://github.com/pmndrs/zustand/discussions/1145)
