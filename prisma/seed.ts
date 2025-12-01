import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fake user data
const fakeUsers = [
  {
    username: 'alice_human',
    displayName: 'Alice',
    bio: 'Verified human exploring the decentralized future 🌍',
    worldcoinId: '0x' + '1'.repeat(64),
    isVerified: true,
    verificationLevel: 'orb',
    rankScore: 2500,
    contributionScore: 1400,
    engagementScore: 1100,
    streakDays: 15,
    invitesCount: 5,
    successfulInvitesCount: 4,
    totalEarnings: 150.5,
    country: 'USA',
    city: 'San Francisco',
  },
  {
    username: 'bob_pioneer',
    displayName: 'Bob',
    bio: 'Pioneer human | Web3 enthusiast | Building the future',
    worldcoinId: '0x' + '2'.repeat(64),
    isVerified: true,
    verificationLevel: 'orb',
    rankScore: 850,
    contributionScore: 500,
    engagementScore: 350,
    streakDays: 8,
    invitesCount: 3,
    successfulInvitesCount: 2,
    totalEarnings: 45.0,
    country: 'UK',
    city: 'London',
  },
  {
    username: 'carol_verified',
    displayName: 'Carol',
    bio: 'Just a verified human doing human things 🤖',
    worldcoinId: '0x' + '3'.repeat(64),
    isVerified: true,
    verificationLevel: 'device',
    rankScore: 180,
    contributionScore: 100,
    engagementScore: 80,
    streakDays: 5,
    invitesCount: 2,
    successfulInvitesCount: 1,
    totalEarnings: 12.0,
    country: 'Canada',
    city: 'Toronto',
  },
  {
    username: 'dave_explorer',
    displayName: 'Dave',
    bio: 'Exploring the humanverse one post at a time',
    worldcoinId: '0x' + '4'.repeat(64),
    isVerified: true,
    verificationLevel: 'orb',
    rankScore: 350,
    contributionScore: 200,
    engagementScore: 150,
    streakDays: 6,
    invitesCount: 1,
    successfulInvitesCount: 1,
    totalEarnings: 25.0,
    country: 'Germany',
    city: 'Berlin',
  },
  {
    username: 'eve_legend',
    displayName: 'Eve',
    bio: 'Human Legend | Community Builder | Verified Human Advocate',
    worldcoinId: '0x' + '5'.repeat(64),
    isVerified: true,
    verificationLevel: 'orb',
    rankScore: 12500,
    contributionScore: 7000,
    engagementScore: 5500,
    streakDays: 45,
    invitesCount: 20,
    successfulInvitesCount: 18,
    totalEarnings: 500.0,
    country: 'USA',
    city: 'New York',
  },
];

// Fake tweets
const fakeTweets = [
  {
    content: "Just verified my humanity with World ID! So excited to be part of this community 🌍✨",
    authorIndex: 0,
  },
  {
    content: "The future of social media is human-verified. No bots, just real people. This is revolutionary!",
    authorIndex: 1,
  },
  {
    content: "Love how this platform prioritizes verified humans. Finally, authentic conversations! 💬",
    authorIndex: 2,
  },
  {
    content: "Building in Web3 and decentralized identity is the future. Proud to be here! 🚀",
    authorIndex: 3,
  },
  {
    content: "Reached Human Legend rank today! Thank you to this amazing community 🎉",
    authorIndex: 4,
  },
  {
    content: "The ability to prove you're human without revealing your identity is a game-changer 🔐",
    authorIndex: 0,
  },
  {
    content: "Just invited my first friend to the platform. Can't wait for them to join! 🤝",
    authorIndex: 1,
  },
  {
    content: "What's everyone's favorite feature of H World so far? Mine is the human verification!",
    authorIndex: 2,
  },
  {
    content: "This is what the internet should have been from the start - human-first, bot-free 🌟",
    authorIndex: 3,
  },
  {
    content: "Shoutout to all the pioneers building this new human-verified web! Keep it up! 💪",
    authorIndex: 4,
  },
  {
    content: "Just earned my first seasonal badge! These gamification features are so fun 🎮",
    authorIndex: 0,
  },
  {
    content: "Love checking the leaderboards and seeing our community grow every day 📈",
    authorIndex: 1,
  },
  {
    content: "The streak feature keeps me coming back daily. Currently at 5 days! 🔥",
    authorIndex: 2,
  },
  {
    content: "Privacy + verification = the perfect combination. World ID nailed it! 🎯",
    authorIndex: 3,
  },
  {
    content: "Remember: every verified human here is helping build the future of the internet 🌐",
    authorIndex: 4,
  },
];

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.retweet.deleteMany();
  await prisma.media.deleteMany();
  await prisma.tweet.deleteMany();
  await prisma.userTag.deleteMany();
  await prisma.humanInfinityVote.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.leaderboardSnapshot.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.season.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data\n');

  // Create users
  console.log('👥 Creating users...');
  const createdUsers = [];
  for (const userData of fakeUsers) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        profilePictureUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        currentRank: getRankFromScore(userData.rankScore),
        lastActiveAt: new Date(),
      },
    });
    createdUsers.push(user);
    console.log(`  ✓ Created user: ${user.displayName} (@${user.username}) - Rank: ${user.currentRank}`);
  }
  console.log('✅ Created users\n');

  // Create some follows
  console.log('🤝 Creating follow relationships...');
  const follows = [
    { follower: 0, following: 1 },
    { follower: 0, following: 2 },
    { follower: 0, following: 4 },
    { follower: 1, following: 0 },
    { follower: 1, following: 4 },
    { follower: 2, following: 0 },
    { follower: 2, following: 1 },
    { follower: 2, following: 4 },
    { follower: 3, following: 0 },
    { follower: 3, following: 4 },
    { follower: 4, following: 0 },
    { follower: 4, following: 1 },
    { follower: 4, following: 2 },
    { follower: 4, following: 3 },
  ];

  for (const follow of follows) {
    await prisma.follow.create({
      data: {
        followerId: createdUsers[follow.follower].id,
        followingId: createdUsers[follow.following].id,
      },
    });
  }
  console.log(`  ✓ Created ${follows.length} follow relationships`);
  console.log('✅ Created follows\n');

  // Create tweets
  console.log('📝 Creating tweets...');
  const createdTweets = [];
  for (const tweetData of fakeTweets) {
    const tweet = await prisma.tweet.create({
      data: {
        content: tweetData.content,
        authorId: createdUsers[tweetData.authorIndex].id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      },
    });
    createdTweets.push(tweet);
  }
  console.log(`  ✓ Created ${createdTweets.length} tweets`);
  console.log('✅ Created tweets\n');

  // Create likes (random likes from users to tweets)
  console.log('❤️  Creating likes...');
  let likesCount = 0;
  for (let i = 0; i < createdTweets.length; i++) {
    const tweet = createdTweets[i];
    const numLikes = Math.floor(Math.random() * 4) + 1; // 1-4 likes per tweet
    
    for (let j = 0; j < numLikes && j < createdUsers.length; j++) {
      try {
        await prisma.like.create({
          data: {
            userId: createdUsers[j].id,
            tweetId: tweet.id,
          },
        });
        likesCount++;
      } catch (e) {
        // Skip if already liked
      }
    }
  }
  console.log(`  ✓ Created ${likesCount} likes`);
  console.log('✅ Created likes\n');

  // Create comments
  console.log('💬 Creating comments...');
  const comments = [
    { content: "This is amazing! Welcome to the community! 🎉", authorIndex: 1, tweetIndex: 0 },
    { content: "Couldn't agree more! 💯", authorIndex: 2, tweetIndex: 1 },
    { content: "Great point! This is the future we need.", authorIndex: 0, tweetIndex: 2 },
    { content: "Keep building! The future is bright ✨", authorIndex: 4, tweetIndex: 3 },
    { content: "Congrats on the milestone! Well deserved 👏", authorIndex: 0, tweetIndex: 4 },
    { content: "100% agree. Privacy matters!", authorIndex: 3, tweetIndex: 5 },
    { content: "That's awesome! Growing the community 🌱", authorIndex: 4, tweetIndex: 6 },
    { content: "The verification system for sure! 🔐", authorIndex: 1, tweetIndex: 7 },
  ];

  for (const comment of comments) {
    await prisma.comment.create({
      data: {
        content: comment.content,
        authorId: createdUsers[comment.authorIndex].id,
        tweetId: createdTweets[comment.tweetIndex].id,
      },
    });
  }
  console.log(`  ✓ Created ${comments.length} comments`);
  console.log('✅ Created comments\n');

  // Create season
  console.log('🎭 Creating season...');
  const season = await prisma.season.create({
    data: {
      name: 'Launch Season',
      theme: 'The Beginning',
      startAt: new Date('2025-11-01'),
      endAt: new Date('2026-02-01'),
      isActive: true,
    },
  });
  console.log(`  ✓ Created season: ${season.name}`);
  console.log('✅ Created season\n');

  // Create tags
  console.log('🏷️  Creating tags...');
  const tags = [
    {
      name: 'Founding Member',
      description: 'One of the first verified humans on H World',
      isLimited: true,
      maxSupply: 1000,
      seasonId: season.id,
    },
    {
      name: 'Beta Tester',
      description: 'Participated in the beta testing phase',
      isLimited: true,
      maxSupply: 500,
      seasonId: season.id,
    },
    {
      name: 'Community Builder',
      description: 'Actively building and growing the community',
      isLimited: false,
      maxSupply: null,
      seasonId: season.id,
    },
  ];

  const createdTags = [];
  for (const tagData of tags) {
    const tag = await prisma.tag.create({
      data: tagData,
    });
    createdTags.push(tag);
    console.log(`  ✓ Created tag: ${tag.name}`);
  }
  console.log('✅ Created tags\n');

  // Grant tags to users
  console.log('🎖️  Granting tags...');
  const tagGrants = [
    { userIndex: 0, tagIndex: 0, reason: 'Early adopter' },
    { userIndex: 0, tagIndex: 2, reason: 'Active community member' },
    { userIndex: 1, tagIndex: 0, reason: 'Early adopter' },
    { userIndex: 1, tagIndex: 1, reason: 'Beta testing participant' },
    { userIndex: 4, tagIndex: 0, reason: 'Early adopter' },
    { userIndex: 4, tagIndex: 1, reason: 'Beta testing participant' },
    { userIndex: 4, tagIndex: 2, reason: 'Community leader' },
  ];

  for (const grant of tagGrants) {
    await prisma.userTag.create({
      data: {
        userId: createdUsers[grant.userIndex].id,
        tagId: createdTags[grant.tagIndex].id,
        reason: grant.reason,
      },
    });
    
    // Update tag supply
    await prisma.tag.update({
      where: { id: createdTags[grant.tagIndex].id },
      data: { currentSupply: { increment: 1 } },
    });
  }
  console.log(`  ✓ Granted ${tagGrants.length} tags to users`);
  console.log('✅ Granted tags\n');

  // Create leaderboard snapshot
  console.log('🏆 Creating leaderboard snapshot...');
  const snapshot = await prisma.leaderboardSnapshot.create({
    data: {
      type: 'GLOBAL_TOP_HUMANS',
      periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      region: null,
      regionType: null,
    },
  });

  // Create leaderboard entries
  const sortedUsers = [...createdUsers].sort((a, b) => b.rankScore - a.rankScore);
  for (let i = 0; i < sortedUsers.length; i++) {
    await prisma.leaderboardEntry.create({
      data: {
        snapshotId: snapshot.id,
        userId: sortedUsers[i].id,
        rankPosition: i + 1,
        score: sortedUsers[i].rankScore,
        metadata: JSON.stringify({
          contributionScore: sortedUsers[i].contributionScore,
          engagementScore: sortedUsers[i].engagementScore,
          streakDays: sortedUsers[i].streakDays,
        }),
      },
    });
  }
  console.log(`  ✓ Created leaderboard with ${sortedUsers.length} entries`);
  console.log('✅ Created leaderboard\n');

  console.log('🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`  - ${createdUsers.length} users`);
  console.log(`  - ${createdTweets.length} tweets`);
  console.log(`  - ${likesCount} likes`);
  console.log(`  - ${comments.length} comments`);
  console.log(`  - ${follows.length} follows`);
  console.log(`  - 1 season`);
  console.log(`  - ${createdTags.length} tags`);
  console.log(`  - ${tagGrants.length} tag grants`);
  console.log(`  - 1 leaderboard snapshot\n`);
}

function getRankFromScore(score: number): string {
  if (score >= 10000) return 'HUMAN_LEGEND';
  if (score >= 2000) return 'HUMAN_ELITE';
  if (score >= 500) return 'HUMAN_PIONEER';
  if (score >= 100) return 'HUMAN_EXPLORER';
  return 'HUMAN_VERIFIED';
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
