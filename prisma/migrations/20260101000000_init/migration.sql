-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "company" TEXT,
    "city" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "specialtyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Specialty_userId_idx" ON "Specialty"("userId");

-- CreateIndex
CREATE INDEX "Specialty_parentId_idx" ON "Specialty"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_userId_parentId_name_key" ON "Specialty"("userId", "parentId", "name");

-- CreateIndex
CREATE INDEX "Contact_userId_idx" ON "Contact"("userId");

-- CreateIndex
CREATE INDEX "Contact_userId_name_idx" ON "Contact"("userId", "name");

-- CreateIndex
CREATE INDEX "Contact_userId_company_idx" ON "Contact"("userId", "company");

-- CreateIndex
CREATE INDEX "Contact_userId_city_idx" ON "Contact"("userId", "city");

-- CreateIndex
CREATE INDEX "Contact_userId_specialtyId_idx" ON "Contact"("userId", "specialtyId");

-- CreateIndex
CREATE INDEX "Contact_userId_isFavorite_idx" ON "Contact"("userId", "isFavorite");

-- AddForeignKey
ALTER TABLE "Specialty" ADD CONSTRAINT "Specialty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialty" ADD CONSTRAINT "Specialty_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enforces uniqueness for parent specialties: PostgreSQL treats NULLs as distinct
-- in the composite unique index, so a separate partial index is required.
-- Maintained manually (Prisma 6 cannot express partial indexes); preserve this
-- statement if the initial migration is regenerated from the schema.
CREATE UNIQUE INDEX "Specialty_userId_name_parent_null_key" ON "Specialty"("userId", "name") WHERE "parentId" IS NULL;

