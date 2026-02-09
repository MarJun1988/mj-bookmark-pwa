/*
  Warnings:

  - You are about to drop the column `comment` on the `versions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "items"
    ADD COLUMN "favicon" TEXT;

-- AlterTable
ALTER TABLE "versions"
    DROP COLUMN "comment";
