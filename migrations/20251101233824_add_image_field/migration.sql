-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT;

UPDATE "User"
SET "image" = "avatarUrl"
WHERE "image" IS NULL AND "avatarUrl" IS NOT NULL;
