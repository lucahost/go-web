/*
  Warnings:

  - The primary key for the `UserGame` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `playerColor` on the `UserGame` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `currentPlayerColor` on the `Game` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserGame" (
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "playerColor" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "gameId", "playerColor"),
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserGame" ("gameId", "playerColor", "userId") SELECT "gameId", "playerColor", "userId" FROM "UserGame";
DROP TABLE "UserGame";
ALTER TABLE "new_UserGame" RENAME TO "UserGame";
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameState" INTEGER NOT NULL DEFAULT 0,
    "board" TEXT NOT NULL DEFAULT '',
    "currentPlayerId" INTEGER,
    "currentPlayerColor" INTEGER,
    "authorId" INTEGER,
    FOREIGN KEY ("id", "currentPlayerId", "currentPlayerColor") REFERENCES "UserGame" ("gameId", "userId", "playerColor") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("authorId", "board", "createdAt", "currentPlayerColor", "currentPlayerId", "gameState", "id", "title", "updatedAt") SELECT "authorId", "board", "createdAt", "currentPlayerColor", "currentPlayerId", "gameState", "id", "title", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
