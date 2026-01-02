# Database Seeded! 🎉

Your H World database has been populated with fake data for testing!

## What was created:

### 👥 **5 Test Users**
1. **Alice** (@alice_human) - Human Elite
   - Rank Score: 2,500
   - Tags: Founding Member, Community Builder
   - Location: San Francisco, USA

2. **Bob** (@bob_pioneer) - Human Pioneer
   - Rank Score: 850
   - Tags: Founding Member, Beta Tester
   - Location: London, UK

3. **Carol** (@carol_verified) - Human Explorer
   - Rank Score: 180
   - Location: Toronto, Canada

4. **Dave** (@dave_explorer) - Human Explorer
   - Rank Score: 350
   - Location: Berlin, Germany

5. **Eve** (@eve_legend) - Human Legend 🏆
   - Rank Score: 12,500
   - Tags: Founding Member, Beta Tester, Community Builder
   - Location: New York, USA
   - 45-day streak!

### 📝 **15 Tweets**
- Mix of content about human verification, Web3, community building
- Distributed across all users
- Posted over the last 7 days

### 💬 **Social Interactions**
- **42 likes** across tweets
- **8 comments** on popular tweets
- **14 follow relationships** between users

### 🎮 **Gamification**
- **1 Active Season**: "Launch Season" (The Beginning)
- **3 Tags Available**:
  - Founding Member (Limited: 1000)
  - Beta Tester (Limited: 500)
  - Community Builder (Unlimited)
- **Leaderboard** snapshot with all rankings

## 🚀 How to Test

### 1. View the Feed
Open http://localhost:3001 (or 3000) and you should see:
- ✅ 15 tweets in the feed
- ✅ User avatars and names
- ✅ Like counts
- ✅ Comment counts

### 2. Check User Profiles
Visit any user's profile to see:
- ✅ Rank badges (Elite, Pioneer, Explorer, Legend)
- ✅ Progress bars to next rank
- ✅ Tags/badges earned
- ✅ Streak counter
- ✅ User's tweets

**Example URLs:**
- Alice: `/profile/[alice-id]`
- Eve (Legend): `/profile/[eve-id]`

### 3. View Leaderboards
Click 🏆 in navigation or visit `/leaderboards` to see:
- ✅ Eve at #1 (Human Legend, 12,500 points)
- ✅ Alice at #2 (Human Elite, 2,500 points)
- ✅ Bob at #3 (Human Pioneer, 850 points)
- ✅ Dave at #4 (Human Explorer, 350 points)
- ✅ Carol at #5 (Human Explorer, 180 points)

### 4. Test with Your Own Account
When you log in with your World ID:
- You'll appear in the database as a new user
- Start at Human Verified rank (0 points)
- Post tweets, get likes, build your rank!
- Eventually appear on leaderboards

## 🔄 Re-seed Database

If you want to reset and re-populate the database:

```bash
npm run seed:full
```

This will:
1. Clear all existing data
2. Create the 5 fake users again
3. Populate with tweets, likes, comments
4. Set up gamification data

## 📊 Check Data Directly

### Option 1: Prisma Studio (GUI)
```bash
npx prisma studio
```
Then visit http://localhost:5555

### Option 2: SQLite CLI
```bash
sqlite3 prisma/dev.db

# List all tables
.tables

# View users
SELECT username, displayName, currentRank, rankScore FROM users;

# View tweets
SELECT content, authorId FROM tweets LIMIT 5;

# View leaderboard
SELECT u.username, l.rankPosition, l.score 
FROM leaderboard_entries l 
JOIN users u ON l.userId = u.id 
ORDER BY l.rankPosition;

# Exit
.quit
```

## 🎯 What to Test

1. **Feed Loading** ✅
   - Should see 15 tweets
   - No "can't fetch feed" error

2. **Rankings** ✅
   - Leaderboard page should show 5 users
   - No "can't fetch rankings" error

3. **User Profiles** ✅
   - Click on any username
   - Should see rank badge, progress, stats

4. **Interactions** ✅
   - Like tweets
   - Comment on tweets
   - Follow users

5. **Gamification** ✅
   - Ranks display correctly
   - Tags show on profiles
   - Leaderboards populate

## 🐛 Troubleshooting

### Feed still empty?
1. Check dev server is running (port 3000 or 3001)
2. Check browser console for errors
3. Try: `npm run seed:full` again

### Rankings not showing?
1. Verify leaderboard data: `npm run admin list-leaderboards`
2. Check API: `curl http://localhost:3000/api/gamification/leaderboards?type=global_top_humans`

### Users have no ranks?
1. Check user data: `npx prisma studio`
2. Users table should have `currentRank`, `rankScore` fields
3. Run: `npm run admin update-ranks`

## 🎉 Success!

You now have a fully populated test database with:
- ✅ Real-looking users with ranks
- ✅ Tweets and social interactions
- ✅ Working leaderboards
- ✅ Seasonal tags and badges
- ✅ Everything connected and working!

**Next:** Log in with your own World ID and start interacting! Your activity will add to the database.

---

**Created:** November 28, 2025
**Seed Script:** `prisma/seed.ts`
