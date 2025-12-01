#!/usr/bin/env ts-node
/**
 * Gamification Admin CLI
 * 
 * Usage:
 *   npx ts-node scripts/gamification-admin.ts <command> [options]
 * 
 * Commands:
 *   create-season <name> <theme> <startDate> <duration>  - Create a new season
 *   create-tag <name> <description> [seasonName] [maxSupply] - Create a new tag
 *   activate-season <seasonName>  - Activate a season
 *   deactivate-season <seasonName> - Deactivate a season
 *   grant-tag <userId> <tagName> [reason] - Grant a tag to a user
 *   list-seasons - List all seasons
 *   list-tags - List all tags
 *   update-ranks - Manually trigger rank update job
 *   update-leaderboards - Manually trigger leaderboard update job
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'create-season':
        await createSeason(args);
        break;
      case 'create-tag':
        await createTag(args);
        break;
      case 'activate-season':
        await activateSeason(args[1]);
        break;
      case 'deactivate-season':
        await deactivateSeason(args[1]);
        break;
      case 'grant-tag':
        await grantTag(args);
        break;
      case 'list-seasons':
        await listSeasons();
        break;
      case 'list-tags':
        await listTags();
        break;
      case 'update-ranks':
        await updateRanks();
        break;
      case 'update-leaderboards':
        await updateLeaderboards();
        break;
      default:
        console.log('Unknown command. Use --help for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSeason(args: string[]) {
  const [, name, theme, startDate, durationDays] = args;
  
  if (!name || !theme || !startDate || !durationDays) {
    console.error('Usage: create-season <name> <theme> <startDate> <duration>');
    console.error('Example: create-season "Winter 2025" "Snow & Ice" "2025-12-01" 90');
    process.exit(1);
  }

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + parseInt(durationDays));

  const season = await prisma.season.create({
    data: {
      name,
      theme,
      startAt: start,
      endAt: end,
      isActive: false,
    },
  });

  console.log('✓ Season created:', season);
}

async function createTag(args: string[]) {
  const [, name, description, seasonName, maxSupply] = args;
  
  if (!name || !description) {
    console.error('Usage: create-tag <name> <description> [seasonName] [maxSupply]');
    console.error('Example: create-tag "Early Adopter" "Joined in the first month" "" 1000');
    process.exit(1);
  }

  let seasonId = null;
  if (seasonName) {
    const season = await prisma.season.findUnique({ where: { name: seasonName } });
    if (!season) {
      console.error(`Season "${seasonName}" not found`);
      process.exit(1);
    }
    seasonId = season.id;
  }

  const tag = await prisma.tag.create({
    data: {
      name,
      description,
      seasonId,
      isLimited: !!maxSupply,
      maxSupply: maxSupply ? parseInt(maxSupply) : null,
    },
  });

  console.log('✓ Tag created:', tag);
}

async function activateSeason(seasonName: string) {
  if (!seasonName) {
    console.error('Usage: activate-season <seasonName>');
    process.exit(1);
  }

  // Deactivate all other seasons first
  await prisma.season.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Activate the specified season
  const season = await prisma.season.update({
    where: { name: seasonName },
    data: { isActive: true },
  });

  console.log('✓ Season activated:', season);
}

async function deactivateSeason(seasonName: string) {
  if (!seasonName) {
    console.error('Usage: deactivate-season <seasonName>');
    process.exit(1);
  }

  const season = await prisma.season.update({
    where: { name: seasonName },
    data: { isActive: false },
  });

  console.log('✓ Season deactivated:', season);
}

async function grantTag(args: string[]) {
  const [, userId, tagName, reason] = args;
  
  if (!userId || !tagName) {
    console.error('Usage: grant-tag <userId> <tagName> [reason]');
    process.exit(1);
  }

  const tag = await prisma.tag.findUnique({ where: { name: tagName } });
  if (!tag) {
    console.error(`Tag "${tagName}" not found`);
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`User "${userId}" not found`);
    process.exit(1);
  }

  // Check if user already has the tag
  const existing = await prisma.userTag.findUnique({
    where: {
      userId_tagId: { userId, tagId: tag.id },
    },
  });

  if (existing) {
    console.log('User already has this tag');
    return;
  }

  // Check supply limit
  if (tag.isLimited && tag.maxSupply) {
    if (tag.currentSupply >= tag.maxSupply) {
      console.error('Tag supply limit reached');
      process.exit(1);
    }
  }

  // Grant the tag
  const userTag = await prisma.userTag.create({
    data: {
      userId,
      tagId: tag.id,
      reason: reason || 'Manually granted by admin',
    },
  });

  // Update supply count
  await prisma.tag.update({
    where: { id: tag.id },
    data: { currentSupply: tag.currentSupply + 1 },
  });

  console.log('✓ Tag granted:', userTag);
}

async function listSeasons() {
  const seasons = await prisma.season.findMany({
    orderBy: { startAt: 'desc' },
    include: {
      _count: {
        select: { tags: true },
      },
    },
  });

  console.log('\n📅 Seasons:');
  seasons.forEach(season => {
    console.log(`\n  ${season.isActive ? '✓' : ' '} ${season.name}`);
    console.log(`    Theme: ${season.theme}`);
    console.log(`    Period: ${season.startAt.toLocaleDateString()} - ${season.endAt.toLocaleDateString()}`);
    console.log(`    Tags: ${season._count.tags}`);
  });
  console.log('');
}

async function listTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      season: true,
      _count: {
        select: { userTags: true },
      },
    },
  });

  console.log('\n🏷️  Tags:');
  tags.forEach(tag => {
    console.log(`\n  ${tag.name}`);
    console.log(`    Description: ${tag.description || 'N/A'}`);
    console.log(`    Season: ${tag.season?.name || 'None'}`);
    console.log(`    Supply: ${tag.currentSupply}${tag.maxSupply ? `/${tag.maxSupply}` : ''}`);
    console.log(`    Holders: ${tag._count.userTags}`);
  });
  console.log('');
}

async function updateRanks() {
  console.log('🔄 Updating ranks...');
  const { updateAllUserRanks } = await import('../src/lib/gamification/rankUpdateJob');
  await updateAllUserRanks();
  console.log('✓ Ranks updated');
}

async function updateLeaderboards() {
  console.log('🔄 Updating leaderboards...');
  const { updateAllLeaderboards } = await import('../src/lib/gamification/leaderboardUpdateJob');
  await updateAllLeaderboards();
  console.log('✓ Leaderboards updated');
}

main();
