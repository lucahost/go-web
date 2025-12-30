/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "Game_id_currentPlayerId_currentPlayerColor_fkey" FOREIGN KEY ("id", "currentPlayerId", "currentPlayerColor") REFERENCES "UserGame" ("gameId", "userId", "playerColor") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("authorId", "board", "createdAt", "currentPlayerColor", "currentPlayerId", "gameState", "id", "title", "updatedAt") SELECT "authorId", "board", "createdAt", "currentPlayerColor", "currentPlayerId", "gameState", "id", "title", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_User" ("id", "name") SELECT "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
CREATE TABLE "new_UserGame" (
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "playerColor" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "gameId", "playerColor"),
    CONSTRAINT "UserGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserGame" ("gameId", "playerColor", "userId") SELECT "gameId", "playerColor", "userId" FROM "UserGame";
DROP TABLE "UserGame";
ALTER TABLE "new_UserGame" RENAME TO "UserGame";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
