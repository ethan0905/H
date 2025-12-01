# Test the APIs 🧪

Quick commands to test that everything is working.

## 1. Test Tweet Feed API

```bash
# Get all tweets (should return 15 tweets)
curl http://localhost:3000/api/tweets | jq '.'

# Get tweets with current user context
curl 'http://localhost:3000/api/tweets?currentUserId=alice-id' | jq '.'
```

## 2. Test User API

```bash
# Get user by ID (replace with actual user ID from database)
curl 'http://localhost:3000/api/users?userId=USER_ID' | jq '.'

# Example: Get first user's data
USER_ID=$(sqlite3 prisma/dev.db "SELECT id FROM users LIMIT 1;")
curl "http://localhost:3000/api/users?userId=$USER_ID" | jq '.'
```

## 3. Test Gamification APIs

### Get User Rank & Tags
```bash
# Get Eve's gamification data (Human Legend)
USER_ID=$(sqlite3 prisma/dev.db "SELECT id FROM users WHERE username='eve_legend';")
curl "http://localhost:3000/api/gamification/user/$USER_ID" | jq '.'
```

Expected response:
```json
{
  "rank": {
    "current": "HUMAN_LEGEND",
    "currentDisplayName": "Human Legend",
    "score": 12500,
    "progress": null
  },
  "tags": [
    {
      "id": "...",
      "name": "Founding Member",
      "description": "One of the first verified humans on H World",
      "isLimited": true,
      "grantedAt": "..."
    },
    // ... more tags
  ],
  "stats": {
    "streakDays": 45,
    "contributionScore": 7000,
    "engagementScore": 5500
  }
}
```

### Get Leaderboards
```bash
# Global Top Humans leaderboard
curl 'http://localhost:3000/api/gamification/leaderboards?type=global_top_humans&limit=10' | jq '.'

# Expected: Eve #1, Alice #2, Bob #3, Dave #4, Carol #5
```

Expected response:
```json
{
  "type": "GLOBAL_TOP_HUMANS",
  "entries": [
    {
      "rank": 1,
      "user": {
        "id": "...",
        "username": "eve_legend",
        "displayName": "Eve",
        "avatar": "..."
      },
      "score": 12500
    },
    // ... more entries
  ],
  "periodStart": "...",
  "periodEnd": "..."
}
```

## 4. Test User Tweets API

```bash
# Get Alice's tweets
USER_ID=$(sqlite3 prisma/dev.db "SELECT id FROM users WHERE username='alice_human';")
curl "http://localhost:3000/api/users/$USER_ID/tweets?type=tweets" | jq '.'

# Get Bob's liked tweets
USER_ID=$(sqlite3 prisma/dev.db "SELECT id FROM users WHERE username='bob_pioneer';")
curl "http://localhost:3000/api/users/$USER_ID/tweets?type=likes" | jq '.'
```

## 5. Check Database Directly

```bash
# Count tweets
sqlite3 prisma/dev.db "SELECT COUNT(*) as tweet_count FROM tweets;"
# Expected: 15

# Count users
sqlite3 prisma/dev.db "SELECT COUNT(*) as user_count FROM users;"
# Expected: 5

# View leaderboard
sqlite3 prisma/dev.db "
SELECT 
  u.username, 
  u.currentRank,
  u.rankScore,
  COUNT(DISTINCT t.id) as tweet_count
FROM users u
LEFT JOIN tweets t ON u.id = t.authorId
GROUP BY u.id
ORDER BY u.rankScore DESC;
"

# View user tags
sqlite3 prisma/dev.db "
SELECT 
  u.username,
  t.name as tag_name,
  ut.reason
FROM user_tags ut
JOIN users u ON ut.userId = u.id
JOIN tags t ON ut.tagId = t.id;
"
```

## 6. Admin CLI Commands

```bash
# List all seasons
npm run admin -- list-seasons

# List all tags
npm run admin -- list-tags

# Update all ranks (recalculate)
npm run admin -- update-ranks

# Update leaderboards
npm run admin -- update-leaderboards

# Grant a tag to Alice
ALICE_ID=$(sqlite3 prisma/dev.db "SELECT id FROM users WHERE username='alice_human';")
npm run admin -- grant-tag "$ALICE_ID" "Beta Tester" "Manual test grant"
```

## 7. Browser Testing

1. **Open the app**: http://localhost:3000 (or 3001)

2. **Check the feed**:
   - Should see 15 tweets
   - Click on usernames to view profiles

3. **Visit a profile**:
   - Copy a user ID from database: `sqlite3 prisma/dev.db "SELECT id FROM users WHERE username='eve_legend';"`
   - Navigate to: `http://localhost:3000/profile/[USER_ID]`
   - Should see:
     - Rank badge (Human Legend for Eve)
     - Progress bar (or "Max Rank" for Eve)
     - Tags/badges
     - Tweet list

4. **Check leaderboards**:
   - Click 🏆 in navigation OR
   - Go to: `http://localhost:3000/leaderboards`
   - Should see all 5 users ranked

## 8. Verify Everything Works

### Checklist:
- [ ] Feed shows 15 tweets
- [ ] User profiles display correctly
- [ ] Rank badges appear on profiles
- [ ] Tags/badges show on profiles
- [ ] Leaderboards page loads with 5 users
- [ ] All APIs return valid JSON
- [ ] No console errors in browser
- [ ] No server errors in terminal

### If something doesn't work:

1. **Check dev server logs** (terminal where you ran `npm run dev`)
2. **Check browser console** (F12 → Console tab)
3. **Verify database has data**:
   ```bash
   sqlite3 prisma/dev.db ".tables"
   sqlite3 prisma/dev.db "SELECT COUNT(*) FROM users;"
   ```
4. **Re-seed if needed**:
   ```bash
   npm run seed:full
   ```

## 9. Quick Test Script

Save this as `test-apis.sh` and run `bash test-apis.sh`:

```bash
#!/bin/bash

echo "🧪 Testing H World APIs..."
echo ""

BASE_URL="http://localhost:3000"

# Test tweets API
echo "1️⃣  Testing Tweets API..."
TWEET_COUNT=$(curl -s "$BASE_URL/api/tweets" | jq '. | length')
echo "   ✓ Found $TWEET_COUNT tweets"

# Get a user ID
USER_ID=$(sqlite3 prisma/dev.db "SELECT id FROM users LIMIT 1;")
echo ""
echo "2️⃣  Testing User API..."
curl -s "$BASE_URL/api/users?userId=$USER_ID" | jq '.username, .currentRank, .rankScore'

echo ""
echo "3️⃣  Testing Gamification API..."
curl -s "$BASE_URL/api/gamification/user/$USER_ID" | jq '.rank.current, .rank.score, .tags | length'

echo ""
echo "4️⃣  Testing Leaderboards API..."
LEADERBOARD_COUNT=$(curl -s "$BASE_URL/api/gamification/leaderboards?type=global_top_humans" | jq '.entries | length')
echo "   ✓ Leaderboard has $LEADERBOARD_COUNT entries"

echo ""
echo "✅ All tests complete!"
```

---

**Tip:** Keep this file handy for quick API testing during development!
