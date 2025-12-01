# H World Gamification System

## Overview

The H World gamification system includes:
1. **Human Ranks** - Progressive ranking system from Human Verified to Human Infinity
2. **Seasonal Tags** - Limited edition tags tied to seasons
3. **Leaderboards** - Global, regional, and weekly leaderboards

## Features

### 1. Human Ranks

Six progressive ranks based on contribution and engagement:

- **Human Verified** (Starting rank for all verified users)
- **Human Explorer** (100+ rank score)
- **Human Pioneer** (500+ rank score)  
- **Human Elite** (2000+ rank score)
- **Human Legend** (10000+ rank score)
- **Human Infinity** (Special rank, requires community votes)

**Rank Score Calculation:**
- Base contribution score (tweets, comments, engagement)
- Engagement score (likes, retweets received)
- Streak bonus (active days in a row)
- Successful invites bonus

### 2. Seasonal Tags

Limited edition badges that users can earn during specific seasons:

- Each season has a theme and time period
- Tags can be limited supply (e.g., first 1000 users)
- Tags display on user profiles and in feeds
- Examples: "Early Adopter", "Winter 2025", "Top Creator"

### 3. Leaderboards

Multiple leaderboard types:

- **Global Top Humans** - By rank score
- **Global Top Creators** - By tweets/content
- **Global Top Earners** - By earnings
- **Regional Leaderboards** - By country, city, or language
- **Weekly Top Contributors** - Reset weekly

## Architecture

```
src/
├── lib/gamification/
│   ├── rankService.ts          # Pure rank calculation logic
│   ├── leaderboardService.ts   # Pure leaderboard scoring logic
│   ├── tagService.ts           # Tag management and granting
│   ├── statsService.ts         # User stats collection
│   ├── rankUpdateJob.ts        # Batch rank updates
│   └── leaderboardUpdateJob.ts # Batch leaderboard updates
├── app/api/gamification/
│   ├── cron/route.ts           # Scheduled job trigger
│   ├── leaderboards/route.ts   # Leaderboard data API
│   └── user/[userId]/route.ts  # User rank/tags API
├── components/gamification/
│   ├── RankBadge.tsx           # Rank badge component
│   ├── RankProgress.tsx        # Rank progress bar
│   ├── TagsDisplay.tsx         # User tags display
│   └── Leaderboard.tsx         # Leaderboard component
└── types/gamification.ts       # TypeScript types
```

## Database Schema

### Extended User Model
```prisma
model User {
  // Gamification fields
  currentRank           String    @default("HUMAN_VERIFIED")
  rankScore             Int       @default(0)
  streakDays            Int       @default(0)
  lastActiveAt          DateTime?
  contributionScore     Int       @default(0)
  engagementScore       Int       @default(0)
  invitesCount          Int       @default(0)
  successfulInvitesCount Int      @default(0)
  totalEarnings         Float     @default(0.0)
  country               String?
  city                  String?
  language              String?   @default("en")
}
```

### New Models
- `Season` - Seasonal periods with themes
- `Tag` - Badge definitions
- `UserTag` - User-tag assignments
- `HumanInfinityVote` - Votes for Human Infinity rank
- `LeaderboardSnapshot` - Point-in-time leaderboard data
- `LeaderboardEntry` - Individual leaderboard positions

## API Endpoints

### GET /api/gamification/user/[userId]
Get user rank, tags, and stats.

**Response:**
```json
{
  "rank": {
    "current": "HUMAN_EXPLORER",
    "currentDisplayName": "Human Explorer",
    "score": 250,
    "progress": {
      "currentRank": "HUMAN_EXPLORER",
      "nextRank": "HUMAN_PIONEER",
      "currentScore": 250,
      "requiredScore": 500,
      "progressPercentage": 50
    }
  },
  "tags": [
    {
      "id": "...",
      "name": "Early Adopter",
      "description": "Joined in the first month",
      "isLimited": true,
      "grantedAt": "2025-11-01T00:00:00.000Z"
    }
  ],
  "stats": {
    "streakDays": 7,
    "contributionScore": 150,
    "engagementScore": 100
  }
}
```

### GET /api/gamification/leaderboards
Get leaderboard data with filters.

**Query Parameters:**
- `type` - global_top_humans, global_top_creators, regional_top_creators, weekly_top
- `region` - (optional) country, city, or language code
- `limit` - (optional) number of results (default: 100)

**Response:**
```json
{
  "type": "GLOBAL_TOP_HUMANS",
  "entries": [
    {
      "rank": 1,
      "user": {
        "id": "...",
        "username": "alice",
        "displayName": "Alice",
        "avatar": "..."
      },
      "score": 15000,
      "metadata": {
        "contributionScore": 8000,
        "engagementScore": 7000
      }
    }
  ],
  "periodStart": "2025-11-01T00:00:00.000Z",
  "periodEnd": "2025-11-28T23:59:59.999Z"
}
```

### POST /api/gamification/cron
Trigger scheduled jobs (protected endpoint).

**Body:**
```json
{
  "job": "update-ranks" | "update-leaderboards"
}
```

## Scheduled Jobs

### Rank Update Job
**Frequency:** Daily at 00:00 UTC

**Process:**
1. Collect stats for all users (tweets, likes, comments, etc.)
2. Calculate rank score for each user
3. Determine new rank based on score and requirements
4. Update user rank if changed
5. Process Human Infinity votes

### Leaderboard Update Job
**Frequency:** Hourly

**Process:**
1. Calculate scores for all leaderboard types
2. Create snapshots with top 100 users
3. Store entries with rank positions
4. Archive old snapshots (keep last 30 days)

## Admin CLI

Use the admin CLI to manage seasons and tags:

```bash
# Create a season
npx ts-node scripts/gamification-admin.ts create-season "Winter 2025" "Snow & Ice" "2025-12-01" 90

# Create a tag
npx ts-node scripts/gamification-admin.ts create-tag "Early Adopter" "Joined in the first month" "" 1000

# Activate a season
npx ts-node scripts/gamification-admin.ts activate-season "Winter 2025"

# Grant a tag to a user
npx ts-node scripts/gamification-admin.ts grant-tag <userId> "Early Adopter" "Manual grant"

# List all seasons
npx ts-node scripts/gamification-admin.ts list-seasons

# List all tags
npx ts-node scripts/gamification-admin.ts list-tags

# Manually trigger rank update
npx ts-node scripts/gamification-admin.ts update-ranks

# Manually trigger leaderboard update
npx ts-node scripts/gamification-admin.ts update-leaderboards
```

## Frontend Integration

### Profile Page

The profile page displays:
- User's current rank badge
- Progress to next rank (if applicable)
- User's tags (limited edition badges)
- Streak counter

```tsx
import { RankBadge } from '@/components/gamification/RankBadge';
import { RankProgress } from '@/components/gamification/RankProgress';
import { TagsDisplay } from '@/components/gamification/TagsDisplay';

// Fetch gamification data
const data = await fetch(`/api/gamification/user/${userId}`).then(r => r.json());

// Display components
<RankBadge rank={data.rank.current} size="md" showLabel />
<RankProgress {...data.rank} />
<TagsDisplay tags={data.tags} maxDisplay={5} />
```

### Feed/Comments

Show mini rank badge next to usernames:

```tsx
<RankBadge rank={user.currentRank} size="sm" showLabel={false} />
```

### Leaderboards Page

Accessible via navigation (`/leaderboards`):
- Tabs for different leaderboard types
- Real-time rankings
- User's position highlighted

## Testing

### Manual Testing

1. Create test users with different activity levels
2. Run rank update job: `npx ts-node scripts/gamification-admin.ts update-ranks`
3. Check user ranks in profiles
4. Run leaderboard update: `npx ts-node scripts/gamification-admin.ts update-leaderboards`
5. View leaderboards page

### Unit Tests (TODO)

Add tests for:
- `computeRankForUser()` - Rank calculation logic
- `computeLeaderboardScore()` - Score calculation for leaderboards
- `canGrantTag()` - Tag granting constraints
- `analyzeRankRequirements()` - Requirement analysis

## Production Deployment

### 1. Environment Variables

Ensure these are set:
```env
DATABASE_URL=<your-database-url>
CRON_SECRET=<random-secret-for-cron-protection>
```

### 2. Database Migration

Run migrations:
```bash
npx prisma migrate deploy
```

### 3. Cron Jobs

Set up cron jobs (e.g., using Vercel Cron, AWS EventBridge, or similar):

**Daily Rank Update (00:00 UTC):**
```
POST /api/gamification/cron
{
  "secret": "<CRON_SECRET>",
  "job": "update-ranks"
}
```

**Hourly Leaderboard Update:**
```
POST /api/gamification/cron
{
  "secret": "<CRON_SECRET>",
  "job": "update-leaderboards"
}
```

### 4. Initial Data

Create initial season and tags:
```bash
npx ts-node scripts/gamification-admin.ts create-season "Launch Season" "The Beginning" "2025-01-01" 365
npx ts-node scripts/gamification-admin.ts activate-season "Launch Season"
npx ts-node scripts/gamification-admin.ts create-tag "Founding Member" "One of the first 1000 members" "Launch Season" 1000
```

## Customization

### Adding New Rank Requirements

Edit `src/lib/gamification/rankService.ts`:

```typescript
export const RANK_REQUIREMENTS: Record<HumanRank, RankRequirement> = {
  // Add new rank or modify existing
  HUMAN_EXPLORER: {
    minScore: 100,
    checks: [
      { type: 'MIN_TWEETS', value: 5, description: 'Post at least 5 tweets' },
      // Add more checks
    ],
  },
};
```

### Adding New Leaderboard Types

Edit `src/lib/gamification/leaderboardService.ts`:

```typescript
export function computeLeaderboardScore(
  user: UserWithStats,
  type: LeaderboardType,
  stats?: any
): number {
  switch (type) {
    case 'MY_NEW_LEADERBOARD':
      // Implement scoring logic
      return myCustomScore;
  }
}
```

### Customizing Tag Granting Logic

Edit `src/lib/gamification/tagService.ts` to add automatic tag grants based on user actions.

## Troubleshooting

### TypeScript Errors After Schema Changes

1. Regenerate Prisma client: `npx prisma generate`
2. Restart TypeScript server in VS Code: `Cmd+Shift+P` > "TypeScript: Restart TS Server"
3. Restart dev server: `npm run dev`

### Ranks Not Updating

1. Check scheduled job is running
2. Manually trigger: `npx ts-node scripts/gamification-admin.ts update-ranks`
3. Check logs for errors

### Leaderboards Empty

1. Ensure leaderboard job has run at least once
2. Check that users have activity/scores
3. Manually trigger: `npx ts-node scripts/gamification-admin.ts update-leaderboards`

## Future Enhancements

- [ ] Achievement system (unlock-based badges)
- [ ] Rank-based perks (post limits, features)
- [ ] Tag trading/marketplace
- [ ] Community challenges
- [ ] Referral rewards
- [ ] Reputation decay for inactive users
- [ ] Seasonal rank resets
- [ ] Custom leaderboards per community

## Support

For issues or questions, contact the development team or open an issue in the repository.
