/*
  Warnings:

  - You are about to drop the `UserGames` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserGames";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UserGame" (
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "playerColor" TEXT NOT NULL,

    PRIMARY KEY ("userId", "gameId", "playerColor"),
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameState" INTEGER NOT NULL DEFAULT 0,
    "board" TEXT NOT NULL DEFAULT '',
    "currentPlayerId" INTEGER,
    "currentPlayerColor" TEXT,
    "authorId" INTEGER,
    FOREIGN KEY ("id", "currentPlayerId", "currentPlayerColor") REFERENCES "UserGame" ("gameId", "userId", "playerColor") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("authorId", "board", "createdAt", "gameState", "id", "title", "updatedAt") SELECT "authorId", "board", "createdAt", "gameState", "id", "title", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
