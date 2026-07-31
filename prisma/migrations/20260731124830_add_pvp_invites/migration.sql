-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "GameMode" ADD VALUE 'PVP';

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "blackUserId" TEXT,
ADD COLUMN     "whiteUserId" TEXT;

-- CreateTable
CREATE TABLE "game_invites" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "inviterColor" TEXT NOT NULL,
    "timeControlInitial" INTEGER,
    "timeControlIncrement" INTEGER,
    "gameId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "game_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_invites_token_key" ON "game_invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "game_invites_gameId_key" ON "game_invites"("gameId");

-- CreateIndex
CREATE INDEX "game_invites_inviteeId_status_idx" ON "game_invites"("inviteeId", "status");

-- CreateIndex
CREATE INDEX "game_invites_inviterId_status_idx" ON "game_invites"("inviterId", "status");

-- CreateIndex
CREATE INDEX "games_whiteUserId_idx" ON "games"("whiteUserId");

-- CreateIndex
CREATE INDEX "games_blackUserId_idx" ON "games"("blackUserId");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_whiteUserId_fkey" FOREIGN KEY ("whiteUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_blackUserId_fkey" FOREIGN KEY ("blackUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_invites" ADD CONSTRAINT "game_invites_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_invites" ADD CONSTRAINT "game_invites_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_invites" ADD CONSTRAINT "game_invites_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;
