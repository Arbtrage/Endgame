import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/chess";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: "demo@chess-coach.local" },
    update: {},
    create: {
      email: "demo@chess-coach.local",
      name: "Demo Player",
      emailVerified: true,
      onboardingComplete: true,
      settings: {
        create: {},
      },
    },
  });

  const existingGames = await prisma.game.count({ where: { userId: demo.id } });
  if (existingGames === 0) {
    await prisma.game.create({
      data: {
        userId: demo.id,
        mode: "COMPUTER",
        status: "COMPLETED",
        result: "WHITE_WIN",
        resultReason: "checkmate",
        playerColor: "white",
        stockfishLevel: 5,
        moveCount: 4,
        pgn: '[Event "Demo Game"]\n\n1. e4 e5 2. Nf3 Nc6 1-0',
        finalFen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 2",
        completedAt: new Date(),
        moves: {
          create: [
            {
              moveNumber: 1,
              san: "e4",
              uci: "e2e4",
              fen: "rnbqkbnr/pppppppp/8/8/4P3/8/5N2/PPPP1PPP b KQkq e3 0 1",
              color: "white",
            },
            {
              moveNumber: 2,
              san: "e5",
              uci: "e7e5",
              fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
              color: "black",
            },
            {
              moveNumber: 3,
              san: "Nf3",
              uci: "g1f3",
              fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
              color: "white",
            },
            {
              moveNumber: 4,
              san: "Nc6",
              uci: "b8c6",
              fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
              color: "black",
            },
          ],
        },
      },
    });

    await prisma.game.create({
      data: {
        userId: demo.id,
        mode: "COMPUTER",
        status: "COMPLETED",
        result: "BLACK_WIN",
        resultReason: "resignation",
        playerColor: "white",
        stockfishLevel: 8,
        moveCount: 6,
        pgn: '[Event "Demo Game 2"]\n\n1. d4 d5 2. c4 e6 0-1',
        finalFen: "rnbqkbnr/pppp1ppp/8/4p3/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        completedAt: new Date(Date.now() - 86400000),
        moves: {
          create: [
            {
              moveNumber: 1,
              san: "d4",
              uci: "d2d4",
              fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
              color: "white",
            },
            {
              moveNumber: 2,
              san: "d5",
              uci: "d7d5",
              fen: "rnbqkbnr/pppppppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2",
              color: "black",
            },
          ],
        },
      },
    });
  }

  console.log("Seeded demo user:", demo.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
