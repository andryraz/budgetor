-- Make password nullable (existing accounts keep their password)
-- Add googleId unique column for Google OAuth accounts

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Account" (
    "id"       TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email"    TEXT NOT NULL DEFAULT '',
    "password" TEXT,
    "googleId" TEXT
);

INSERT INTO "new_Account" ("id", "username", "email", "password")
SELECT "id", "username", "email", "password" FROM "Account";

DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";

CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
CREATE UNIQUE INDEX "Account_googleId_key" ON "Account"("googleId") WHERE "googleId" IS NOT NULL;

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;