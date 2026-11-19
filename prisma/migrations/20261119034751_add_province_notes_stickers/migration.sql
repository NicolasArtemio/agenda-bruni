-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "stickerId" TEXT;

-- CreateTable
CREATE TABLE "Sticker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sticker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sticker_userId_idx" ON "Sticker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Sticker_userId_name_key" ON "Sticker"("userId", "name");

-- CreateIndex
CREATE INDEX "Contact_userId_province_idx" ON "Contact"("userId", "province");

-- CreateIndex
CREATE INDEX "Contact_userId_stickerId_idx" ON "Contact"("userId", "stickerId");

-- AddForeignKey
ALTER TABLE "Sticker" ADD CONSTRAINT "Sticker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "Sticker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
