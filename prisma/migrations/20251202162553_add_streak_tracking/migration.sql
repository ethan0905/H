-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldcoinId" TEXT,
    "worldId" TEXT,
    "walletAddress" TEXT,
    "nullifierHash" TEXT,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "profilePictureUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "isSeasonOneOG" BOOLEAN NOT NULL DEFAULT false,
    "verificationLevel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "currentRank" TEXT NOT NULL DEFAULT 'HUMAN_VERIFIED',
    "rankScore" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastStreakDate" DATETIME,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" DATETIME,
    "contributionScore" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" INTEGER NOT NULL DEFAULT 0,
    "invitesCount" INTEGER NOT NULL DEFAULT 0,
    "successfulInvitesCount" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" REAL NOT NULL DEFAULT 0.0,
    "country" TEXT,
    "city" TEXT,
    "language" TEXT DEFAULT 'en',
    "invitedById" TEXT,
    CONSTRAINT "users_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("avatar", "bio", "city", "contributionScore", "country", "createdAt", "currentRank", "displayName", "engagementScore", "id", "invitedById", "invitesCount", "isPro", "isSeasonOneOG", "isVerified", "language", "lastActiveAt", "nullifierHash", "profilePictureUrl", "rankScore", "streakDays", "successfulInvitesCount", "totalEarnings", "updatedAt", "username", "verificationLevel", "walletAddress", "worldId", "worldcoinId") SELECT "avatar", "bio", "city", "contributionScore", "country", "createdAt", "currentRank", "displayName", "engagementScore", "id", "invitedById", "invitesCount", "isPro", "isSeasonOneOG", "isVerified", "language", "lastActiveAt", "nullifierHash", "profilePictureUrl", "rankScore", "streakDays", "successfulInvitesCount", "totalEarnings", "updatedAt", "username", "verificationLevel", "walletAddress", "worldId", "worldcoinId" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_worldcoinId_key" ON "users"("worldcoinId");
CREATE UNIQUE INDEX "users_worldId_key" ON "users"("worldId");
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");
CREATE UNIQUE INDEX "users_nullifierHash_key" ON "users"("nullifierHash");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
