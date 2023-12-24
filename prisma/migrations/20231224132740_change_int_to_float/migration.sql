/*
  Warnings:

  - You are about to alter the column `setFx` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "telegramId" BIGINT NOT NULL PRIMARY KEY,
    "phone_number" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setFx" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("createdAt", "name", "phone_number", "setFx", "telegramId", "updatedAt") SELECT "createdAt", "name", "phone_number", "setFx", "telegramId", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
