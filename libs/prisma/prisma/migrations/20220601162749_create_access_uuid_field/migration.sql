/*
  Warnings:

  - The required column `accessUuid` was added to the `Tenant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "accessUuid" TEXT NOT NULL;
