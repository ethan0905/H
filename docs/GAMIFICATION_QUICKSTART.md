# Gamification Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Verify Database Schema
```bash
cd /Users/ethan/Desktop/H

# Ensure migrations are applied
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Step 2: Create Initial Season & Tags
```bash
# Create a season
npx ts-node scripts/gamification-admin.ts create-season \
  "Beta Season" "Testing Phase" "2025-11-28" 30

# Activate the season
npx ts-node scripts/gamification-admin.ts activate-season "Beta Season"

# Create some tags
npx ts-node scripts/gamification-admin.ts create-tag \
  "Beta Tester" "Participated in beta testing" "Beta Season" 500

npx ts-node scripts/gamification-admin.ts create-tag \
  "Early Adopter" "Joined in the first week" "" 1000

npx ts-node scripts/gamification-admin.ts create-tag \
  "Super Contributor" "Top 100 contributors" "" 100
```

### Step 3: Run Test Script
```bash
# Verify everything is set up correctly
npx ts-node scripts/test-gamification.ts
```

### Step 4: Start Dev Server
```bash
npm run dev
```

### Step 5: Test the UI

1. **Open the app**: http://localhost:3000
2. **Sign in** with World ID or wallet
3. **Create some activity**:
   - Post a few tweets
   - Like and comment on posts
   - Follow other users
4. **Update ranks**:
   ```bash
   npx ts-node scripts/gamification-admin.ts update-ranks
   ```
5. **View your profile** - you should see:
   - Your rank badge
   - Progress to next rank
   - Any tags you've earned
6. **Grant yourself a test tag**:
   ```bash
   npx ts-node scripts/gamification-admin.ts grant-tag <your-user-id> "Beta Tester"
   ```
7. **Update leaderboards**:
   ```bash
   npx ts-node scripts/gamification-admin.ts update-leaderboards
   ```
8. **Visit leaderboards**: Click 🏆 in navigation or go to `/leaderboards`

## 🎮 Testing Different Ranks

To test different rank levels, you can manually update a user's scores:

```bash
# Connect to Prisma Studio
npx prisma studio

# Or use SQL directly (SQLite example)
sqlite3 prisma/dev.db

# Update user rank score
UPDATE users SET rankScore = 150, contributionScore = 80, engagementScore = 70 WHERE id = '<user-id>';

# Run rank update to recalculate rank
npx ts-node scripts/gamification-admin.ts update-ranks
```

### Rank Score Thresholds
- **Human Verified**: 0+
- **Human Explorer**: 100+
- **Human Pioneer**: 500+
- **Human Elite**: 2000+
- **Human Legend**: 10000+
- **Human Infinity**: Requires votes from 10+ Human Legends

## 📊 Viewing Data

### Option 1: Prisma Studio (GUI)
```bash
npx prisma studio
```
Then visit http://localhost:5555 to browse all data.

### Option 2: CLI Tools
```bash
# List all seasons
npx ts-node scripts/gamification-admin.ts list-seasons

# List all tags
npx ts-node scripts/gamification-admin.ts list-tags
```

### Option 3: API Endpoints
```bash
# Get user gamification data
curl http://localhost:3000/api/gamification/user/<user-id>

# Get leaderboards
curl http://localhost:3000/api/gamification/leaderboards?type=global_top_humans&limit=10
```

## 🔄 Scheduled Jobs

In production, set up cron jobs to run these automatically:

### Daily (00:00 UTC) - Update Ranks
```bash
curl -X POST http://localhost:3000/api/gamification/cron \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cron-secret", "job": "update-ranks"}'
```

### Hourly - Update Leaderboards
```bash
curl -X POST http://localhost:3000/api/gamification/cron \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cron-secret", "job": "update-leaderboards"}'
```

For development, run manually:
```bash
npx ts-node scripts/gamification-admin.ts update-ranks
npx ts-node scripts/gamification-admin.ts update-leaderboards
```

## 🐛 Troubleshooting

### TypeScript shows errors for Prisma models
**This is a known issue** - the TypeScript language server hasn't picked up the new Prisma client.

**Fix:**
1. In VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Or restart the dev server

The code **will work at runtime** - the errors are cosmetic.

### "Property 'season' does not exist on type 'PrismaClient'"
Same issue as above. The Prisma client is correctly generated, TypeScript just needs to reload.

### Ranks/tags not showing on profile
1. Make sure you've run the rank update job
2. Check the API response: `curl http://localhost:3000/api/gamification/user/<user-id>`
3. Check browser console for errors
4. Verify the user has activity in the database

### Leaderboards are empty
1. Run the leaderboard update job: `npx ts-node scripts/gamification-admin.ts update-leaderboards`
2. Make sure users have activity/scores
3. Check the API response: `curl http://localhost:3000/api/gamification/leaderboards?type=global_top_humans`

## 📖 Next Steps

1. **Read the full documentation**: See `GAMIFICATION.md`
2. **Check implementation status**: See `GAMIFICATION_STATUS.md`
3. **Customize ranks**: Edit `src/lib/gamification/rankService.ts`
4. **Add new leaderboards**: Edit `src/lib/gamification/leaderboardService.ts`
5. **Create more tags**: Use the admin CLI

## 🎉 Success!

If you can see:
- ✅ Your rank badge on your profile
- ✅ Progress bar showing path to next rank
- ✅ Tags/badges you've earned
- ✅ Leaderboards page with rankings
- ✅ Rank badges on user profiles

Then the gamification system is working! 🎊

---

**Need help?** Check `GAMIFICATION.md` for detailed documentation or `GAMIFICATION_STATUS.md` for troubleshooting.
