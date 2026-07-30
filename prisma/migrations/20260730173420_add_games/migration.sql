-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('COMPUTER', 'AI_OPPONENT', 'COACH');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "GameResult" AS ENUM ('WHITE_WIN', 'BLACK_WIN', 'DRAW', 'ABANDONED');

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "GameMode" NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "result" "GameResult",
    "resultReason" TEXT,
    "playerColor" TEXT NOT NULL,
    "stockfishLevel" INTEGER,
    "aiPersonality" TEXT,
    "timeControlInitial" INTEGER,
    "timeControlIncrement" INTEGER,
    "pgn" TEXT,
    "finalFen" TEXT,
    "moveCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moves" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "moveNumber" INTEGER NOT NULL,
    "san" TEXT NOT NULL,
    "uci" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "games_userId_createdAt_idx" ON "games"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "games_userId_status_idx" ON "games"("userId", "status");

-- CreateIndex
CREATE INDEX "moves_gameId_idx" ON "moves"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "moves_gameId_moveNumber_key" ON "moves"("gameId", "moveNumber");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
