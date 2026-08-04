-- Per-user analysis: one row per (gameId, userId) for PvP parity

ALTER TABLE "analyses" ADD COLUMN "userId" TEXT;
ALTER TABLE "analyses" ADD COLUMN "analysisMode" TEXT;
ALTER TABLE "analyses" ADD COLUMN "analysisDepth" INTEGER;

UPDATE "analyses" AS a
SET "userId" = g."userId",
    "analysisMode" = 'standard'
FROM "games" AS g
WHERE a."gameId" = g."id";

ALTER TABLE "analyses" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "analyses" DROP CONSTRAINT IF EXISTS "analyses_gameId_key";

ALTER TABLE "analyses" ADD CONSTRAINT "analyses_gameId_userId_key" UNIQUE ("gameId", "userId");

ALTER TABLE "analyses" ADD CONSTRAINT "analyses_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "analyses_userId_createdAt_idx" ON "analyses"("userId", "createdAt" DESC);
