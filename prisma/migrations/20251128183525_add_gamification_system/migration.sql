-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "seasonId" TEXT,
    "isLimited" BOOLEAN NOT NULL DEFAULT false,
    "maxSupply" INTEGER,
    "currentSupply" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tags_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    CONSTRAINT "user_tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "human_infinity_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voterId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "human_infinity_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "human_infinity_votes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leaderboard_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "region" TEXT,
    "regionType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rankPosition" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "leaderboard_entries_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "leaderboard_snapshots" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "leaderboard_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldcoinId" TEXT,
    "walletAddress" TEXT,
    "nullifierHash" TEXT,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "profilePictureUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationLevel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "currentRank" TEXT NOT NULL DEFAULT 'HUMAN_VERIFIED',
    "rankScore" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_users" ("avatar", "bio", "createdAt", "displayName", "id", "isVerified", "nullifierHash", "profilePictureUrl", "updatedAt", "username", "verificationLevel", "walletAddress", "worldcoinId") SELECT "avatar", "bio", "createdAt", "displayName", "id", "isVerified", "nullifierHash", "profilePictureUrl", "updatedAt", "username", "verificationLevel", "walletAddress", "worldcoinId" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_worldcoinId_key" ON "users"("worldcoinId");
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");
CREATE UNIQUE INDEX "users_nullifierHash_key" ON "users"("nullifierHash");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "seasons_name_key" ON "seasons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_tags_userId_tagId_key" ON "user_tags"("userId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "human_infinity_votes_voterId_candidateId_key" ON "human_infinity_votes"("voterId", "candidateId");

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_type_periodEnd_idx" ON "leaderboard_snapshots"("type", "periodEnd");

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_type_region_periodEnd_idx" ON "leaderboard_snapshots"("type", "region", "periodEnd");

-- CreateIndex
CREATE INDEX "leaderboard_entries_snapshotId_rankPosition_idx" ON "leaderboard_entries"("snapshotId", "rankPosition");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_snapshotId_userId_key" ON "leaderboard_entries"("snapshotId", "userId");
