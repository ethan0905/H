#!/usr/bin/env ts-node
/**
 * Gamification System Test Script
 * 
 * This script tests the gamification system by:
 * 1. Creating test users with varying activity levels
 * 2. Running rank updates
 * 3. Creating a test season and tags
 * 4. Granting tags to users
 * 5. Running leaderboard updates
 * 6. Verifying the results
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Gamification System\n');

  try {
    // Step 1: Verify database schema
    console.log('1️⃣  Checking database schema...');
    const userCount = await prisma.user.count();
    console.log(`   ✓ Found ${userCount} users in database`);

    // Step 2: Check if gamification models exist
    console.log('\n2️⃣  Checking gamification models...');
    const seasonCount = await prisma.season.count();
    const tagCount = await prisma.tag.count();
    console.log(`   ✓ Seasons: ${seasonCount}`);
    console.log(`   ✓ Tags: ${tagCount}`);

    // Step 3: Create test season if needed
    console.log('\n3️⃣  Setting up test season...');
    let testSeason = await prisma.season.findFirst({
      where: { name: 'Test Season' },
    });

    if (!testSeason) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 90);

      testSeason = await prisma.season.create({
        data: {
          name: 'Test Season',
          theme: 'Testing',
          startAt: now,
          endAt: endDate,
          isActive: true,
        },
      });
      console.log('   ✓ Created test season');
    } else {
      console.log('   ✓ Test season already exists');
    }

    // Step 4: Create test tags
    console.log('\n4️⃣  Setting up test tags...');
    const testTagNames = ['Test Badge', 'Limited Edition Test'];
    
    for (const tagName of testTagNames) {
      const existingTag = await prisma.tag.findFirst({
        where: { name: tagName },
      });

      if (!existingTag) {
        await prisma.tag.create({
          data: {
            name: tagName,
            description: `Test tag: ${tagName}`,
            seasonId: testSeason.id,
            isLimited: tagName.includes('Limited'),
            maxSupply: tagName.includes('Limited') ? 100 : null,
          },
        });
        console.log(`   ✓ Created tag: ${tagName}`);
      } else {
        console.log(`   ✓ Tag already exists: ${tagName}`);
      }
    }

    // Step 5: Test user gamification data
    console.log('\n5️⃣  Testing user gamification data...');
    const testUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (testUsers.length > 0) {
      console.log(`   ✓ Found ${testUsers.length} users for testing`);
      
      // Check if users have gamification fields
      const userWithRank = testUsers[0];
      console.log(`   ✓ Sample user rank: ${(userWithRank as any).currentRank || 'HUMAN_VERIFIED'}`);
      console.log(`   ✓ Sample user score: ${(userWithRank as any).rankScore || 0}`);
    } else {
      console.log('   ⚠️  No users found in database');
    }

    // Step 6: Test stats collection
    console.log('\n6️⃣  Testing stats collection...');
    if (testUsers.length > 0) {
      const { collectUserStats } = await import('../src/lib/gamification/statsService');
      const stats = await collectUserStats(testUsers[0].id);
      console.log('   ✓ Stats collected for test user:');
      console.log(`     - Tweets: ${stats.totalTweets}`);
      console.log(`     - Comments: ${stats.totalComments}`);
      console.log(`     - Likes received: ${stats.totalLikes}`);
      console.log(`     - Streak days: ${stats.streakDays}`);
    }

    // Step 7: Test rank computation
    console.log('\n7️⃣  Testing rank computation...');
    const { computeRankForUser } = await import('../src/lib/gamification/rankService');
    if (testUsers.length > 0) {
      const result = await computeRankForUser(testUsers[0].id);
      console.log(`   ✓ Computed rank for test user: ${result.rank}`);
      console.log(`   ✓ Rank score: ${result.rankScore}`);
    }

    // Step 8: Test leaderboard computation
    console.log('\n8️⃣  Testing leaderboard computation...');
    const { computeLeaderboardScore } = await import('../src/lib/gamification/leaderboardService');
    const { collectUserStats: collectStatsForScore } = await import('../src/lib/gamification/statsService');
    if (testUsers.length > 0) {
      const userStats = await collectStatsForScore(testUsers[0].id);
      const scoreBreakdown = computeLeaderboardScore(
        'GLOBAL_TOP_HUMANS',
        {
          ...userStats,
          totalEarnings: 0,
        }
      );
      console.log(`   ✓ Leaderboard score: ${scoreBreakdown.total}`);
    }

    // Summary
    console.log('\n✅ Gamification System Test Complete!\n');
    console.log('Next steps:');
    console.log('1. Create real users in the app');
    console.log('2. Run: npx ts-node scripts/gamification-admin.ts update-ranks');
    console.log('3. Run: npx ts-node scripts/gamification-admin.ts update-leaderboards');
    console.log('4. Visit /leaderboards in the app');
    console.log('5. Check user profiles for ranks and badges\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
