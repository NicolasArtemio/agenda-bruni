/*
  Incremental migration: a contact can now have multiple stickers.

  Prisma's generated SQL drops "Contact"."stickerId" before copying its data,
  so this migration creates the join table first and backfills it from the
  existing "stickerId" values before dropping the column.
*/

-- CreateTable
CREATE TABLE "ContactSticker" (
    "contactId" TEXT NOT NULL,
    "stickerId" TEXT NOT NULL,

    CONSTRAINT "ContactSticker_pkey" PRIMARY KEY ("contactId","stickerId")
);

-- CreateIndex
CREATE INDEX "ContactSticker_stickerId_idx" ON "ContactSticker"("stickerId");

-- AddForeignKey
ALTER TABLE "ContactSticker" ADD CONSTRAINT "ContactSticker_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactSticker" ADD CONSTRAINT "ContactSticker_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "Sticker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: preserve existing single-sticker assignments before the column is dropped.
INSERT INTO "ContactSticker" ("contactId", "stickerId")
SELECT "id", "stickerId" FROM "Contact" WHERE "stickerId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_stickerId_fkey";

-- DropIndex
DROP INDEX "Contact_userId_stickerId_idx";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "stickerId";
