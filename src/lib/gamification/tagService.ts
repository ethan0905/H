/**
 * Tag Management Service
 * 
 * Handles granting, revoking, and managing limited edition tags.
 * Enforces seasonal constraints and supply limits.
 */

import { prisma } from '@/lib/prisma';
import { TagConfig, TagGrant } from '@/types/gamification';

/**
 * Grant a tag to a user with validation
 * Returns true if granted successfully, false if already has tag or constraints failed
 */
export async function grantTagToUser(
  userId: string,
  tagId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user already has this tag
    const existing = await prisma.userTag.findUnique({
      where: {
        userId_tagId: { userId, tagId },
      },
    });

    if (existing) {
      return { success: false, message: 'User already has this tag' };
    }

    // Get tag details
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: { season: true },
    });

    if (!tag) {
      return { success: false, message: 'Tag not found' };
    }

    // Check if tag can be granted
    const canGrant = await canGrantTag(tag);
    if (!canGrant.allowed) {
      return { success: false, message: canGrant.reason };
    }

    // Grant the tag
    await prisma.$transaction([
      prisma.userTag.create({
        data: {
          userId,
          tagId,
          reason: reason || 'Automatically granted',
        },
      }),
      // Increment supply counter for limited tags
      ...(tag.isLimited
        ? [
            prisma.tag.update({
              where: { id: tagId },
              data: { currentSupply: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    return { success: true, message: 'Tag granted successfully' };
  } catch (error) {
    console.error('Error granting tag:', error);
    return { success: false, message: 'Failed to grant tag' };
  }
}

/**
 * Check if a tag can be granted based on season and supply constraints
 */
export async function canGrantTag(
  tag: any // Tag with season relation
): Promise<{ allowed: boolean; reason: string }> {
  // Check if tag is limited and at max supply
  if (tag.isLimited && tag.maxSupply !== null) {
    if (tag.currentSupply >= tag.maxSupply) {
      return {
        allowed: false,
        reason: `Tag has reached maximum supply (${tag.maxSupply})`,
      };
    }
  }

  // Check if tag is seasonal and season is active
  if (tag.seasonId && tag.season) {
    const now = new Date();
    const seasonStart = new Date(tag.season.startAt);
    const seasonEnd = new Date(tag.season.endAt);

    if (now < seasonStart) {
      return {
        allowed: false,
        reason: 'Season has not started yet',
      };
    }

    if (now > seasonEnd) {
      return {
        allowed: false,
        reason: 'Season has ended - this limited tag can no longer be granted',
      };
    }

    if (!tag.season.isActive) {
      return {
        allowed: false,
        reason: 'Season is not active',
      };
    }
  }

  return { allowed: true, reason: 'OK' };
}

/**
 * Create a new tag
 */
export async function createTag(config: TagConfig): Promise<string> {
  const tag = await prisma.tag.create({
    data: {
      name: config.name,
      description: config.description,
      seasonId: config.seasonId,
      isLimited: config.isLimited,
      maxSupply: config.maxSupply,
      metadata: config.metadata ? JSON.stringify(config.metadata) : null,
    },
  });

  return tag.id;
}

/**
 * Create a new season
 */
export async function createSeason(config: {
  name: string;
  theme: string;
  startAt: Date;
  endAt: Date;
  isActive?: boolean;
}): Promise<string> {
  const season = await prisma.season.create({
    data: {
      name: config.name,
      theme: config.theme,
      startAt: config.startAt,
      endAt: config.endAt,
      isActive: config.isActive ?? false,
    },
  });

  return season.id;
}

/**
 * Close a season (prevents further tag grants from that season)
 */
export async function closeSeason(seasonId: string): Promise<void> {
  await prisma.season.update({
    where: { id: seasonId },
    data: {
      isActive: false,
      endAt: new Date(), // Set end date to now
    },
  });
}

/**
 * Get all tags for a user
 */
export async function getUserTags(userId: string) {
  return prisma.userTag.findMany({
    where: { userId },
    include: {
      tag: {
        include: {
          season: true,
        },
      },
    },
    orderBy: {
      grantedAt: 'desc',
    },
  });
}

/**
 * Auto-grant "First 1000 Humans" tag
 * Call this when a user verifies their World ID
 */
export async function grantFirst1000Tag(userId: string): Promise<void> {
  const tag = await prisma.tag.findFirst({
    where: { name: 'First 1000 Humans' },
  });

  if (!tag) {
    console.warn('First 1000 Humans tag not found');
    return;
  }

  // Check if under 1000 supply
  if (tag.currentSupply < 1000) {
    await grantTagToUser(userId, tag.id, 'Early verified human');
  }
}

/**
 * Auto-grant seasonal tags based on activity
 * Call this periodically or when checking user activity
 */
export async function grantSeasonalTags(
  userId: string,
  seasonId: string
): Promise<void> {
  // Get active season tags
  const seasonTags = await prisma.tag.findMany({
    where: {
      seasonId,
      isLimited: true,
    },
  });

  // Check user activity during season
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
  });

  if (!season || !season.isActive) return;

  // Get user's posts during season
  const postsInSeason = await prisma.tweet.count({
    where: {
      authorId: userId,
      createdAt: {
        gte: season.startAt,
        lte: season.endAt,
      },
    },
  });

  // Grant "Season X OG" tag if user posted at least once during season
  if (postsInSeason >= 1) {
    const ogTag = seasonTags.find((t) => t.name.includes('OG'));
    if (ogTag) {
      await grantTagToUser(
        userId,
        ogTag.id,
        `Posted ${postsInSeason} times during ${season.name}`
      );
    }
  }

  // Grant "Humanity Builder" if user invited others during season
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { successfulInvitesCount: true },
  });

  if (user && user.successfulInvitesCount >= 5) {
    const builderTag = seasonTags.find((t) => t.name.includes('Builder'));
    if (builderTag) {
      await grantTagToUser(
        userId,
        builderTag.id,
        'Invited 5+ humans during season'
      );
    }
  }
}

/**
 * Grant "Verified by Orb" tag for orb-verified users
 */
export async function grantOrbVerifiedTag(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { verificationLevel: true },
  });

  if (user?.verificationLevel === 'orb') {
    const tag = await prisma.tag.findFirst({
      where: { name: 'Verified by Orb' },
    });

    if (tag) {
      await grantTagToUser(userId, tag.id, 'Orb verification completed');
    }
  }
}
