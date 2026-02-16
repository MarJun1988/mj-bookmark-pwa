-- DropForeignKey
ALTER TABLE "tabs"
    DROP CONSTRAINT "tabs_userId_fkey";

-- AddForeignKey
ALTER TABLE "tabs"
    ADD CONSTRAINT "tabs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
