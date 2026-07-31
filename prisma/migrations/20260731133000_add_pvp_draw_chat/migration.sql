-- AlterTable
ALTER TABLE "games" ADD COLUMN "pendingDrawOfferUserId" TEXT,
ADD COLUMN "pendingDrawOfferAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "game_messages" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_messages_gameId_createdAt_idx" ON "game_messages"("gameId", "createdAt");

-- AddForeignKey
ALTER TABLE "game_messages" ADD CONSTRAINT "game_messages_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_messages" ADD CONSTRAINT "game_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
