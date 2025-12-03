# Home Feed Debugging - Can't Fetch Tweets

## Issue
Home page is not displaying tweets - feed appears to not be loading.

## Diagnostic Steps Taken

### 1. Checked Database
✅ Database has 25 tweets
✅ Tweet data looks correct with proper author relationships

### 2. Added Comprehensive Logging

#### API Endpoint (`/src/app/api/tweets/route.ts`)
Added logging to track:
- Request received
- Query parameters (limit, offset, userId)
- Number of tweets fetched
- Response details
- Any errors with full details

#### Client Store (`/src/store/tweetStore.ts`)
Added logging to track:
- fetchTweets function calls
- API URL being fetched
- Response status and data
- Number of tweets received
- Any errors during fetch

### 3. How to Debug

**Open Browser Console** and look for these logs:

```
🔄 fetchTweets called: { offset: 0, userId: 'xxx' }
📡 Fetching from URL: /api/tweets?offset=0&limit=20&userId=xxx
📦 Response received: { ok: true, status: 200, dataKeys: [...], tweetsCount: 20 }
✅ Setting tweets (fresh load): 20
```

**Check Server Terminal** for:
```
📥 GET /api/tweets - Request received
📊 Fetching tweets: { limit: 20, offset: 0, userId: 'xxx' }
✅ Successfully fetched tweets: { count: 20, hasMore: true, total: 25 }
```

## Possible Issues

### 1. Authentication Problem
- Feed tries to fetch with userId from authenticated user
- If user object is missing or incorrect, might fail
- **Check**: Console log showing `userId` value

### 2. API Response Format Mismatch
- Frontend expects: `{ tweets: [...], hasMore: boolean }`
- If API returns different format, will fail
- **Check**: Console log showing `dataKeys` in response

### 3. Error Being Swallowed
- Error might be happening but not displayed
- **Check**: Console for any error logs with ❌

### 4. CORS or Network Issue
- API call might be blocked
- **Check**: Network tab in DevTools for failed requests

### 5. Component Not Mounting
- Feed component might not be rendering
- **Check**: React DevTools to see if Feed component exists

## Expected Behavior

1. User loads home page
2. Feed component mounts
3. useEffect triggers fetchTweets
4. API call to `/api/tweets?offset=0&limit=20&userId=xxx`
5. Server returns 20 tweets
6. Tweets displayed in feed

## Files Modified

1. `/src/app/api/tweets/route.ts` - Added comprehensive logging
2. `/src/store/tweetStore.ts` - Added fetch logging

## Next Steps

1. **Check browser console** for error messages or logs
2. **Check server terminal** for API logs
3. **Look for network errors** in DevTools Network tab
4. **Verify user authentication** - is `user.id` correct?
5. **Check if error is displayed** - look for red error message in UI

## Quick Test

Open browser console and run:
```javascript
fetch('/api/tweets?offset=0&limit=20')
  .then(r => r.json())
  .then(data => console.log('Manual test:', data))
  .catch(err => console.error('Manual test error:', err))
```

This will test if the API works independently of the React components.

---

**Status**: 🔍 Debugging logs added, waiting for console output
**Date**: December 3, 2025
**Next**: Check browser console and server logs to identify specific error
