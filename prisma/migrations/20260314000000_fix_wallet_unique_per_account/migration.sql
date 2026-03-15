-- Fix Wallet unique constraint: from global (name) to composite (name + accountId)
-- Before: two accounts could NOT have a wallet with the same name
-- After:  two accounts CAN have wallets with the same name — uniqueness is per account

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Wallet" (
    "id"                    TEXT NOT NULL PRIMARY KEY,
    "name"                  TEXT NOT NULL,
    "type"                  TEXT NOT NULL,
    "description"           TEXT,
    "amount"                INTEGER NOT NULL,
    "isActive"              BOOLEAN NOT NULL DEFAULT true,
    "createdAt"             DATETIME DEFAULT CURRENT_TIMESTAMP,
    "haveAutomaticIncome"   BOOLEAN DEFAULT false,
    "automaticIncomeAmount" INTEGER DEFAULT 0,
    "automaticIncomeDay"    INTEGER DEFAULT 1,
    "color"                 TEXT NOT NULL DEFAULT '#00ff00',
    "isArchived"            BOOLEAN NOT NULL DEFAULT false,
    "iconRef"               TEXT,
    "accountId"             TEXT NOT NULL,
    CONSTRAINT "Wallet_accountId_fkey" FOREIGN KEY ("accountId")
        REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Wallet" SELECT * FROM "Wallet";

DROP TABLE "Wallet";
ALTER TABLE "new_Wallet" RENAME TO "Wallet";

-- Drop old global unique index on name only
-- Create new composite unique index on (name, accountId)
CREATE UNIQUE INDEX "Wallet_name_accountId_key" ON "Wallet"("name", "accountId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;