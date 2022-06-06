/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,lastTradedSecond]` on the table `KLine` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lastTradedSecond` to the `KLine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KLine" ADD COLUMN     "lastTradedSecond" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "KLine_tenantId_lastTradedSecond_key" ON "KLine"("tenantId", "lastTradedSecond");
