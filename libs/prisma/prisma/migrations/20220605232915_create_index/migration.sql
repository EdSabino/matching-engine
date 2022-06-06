/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,market,lastTradedSecond]` on the table `KLine` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "KLine_tenantId_lastTradedSecond_key";

-- CreateIndex
CREATE UNIQUE INDEX "KLine_tenantId_market_lastTradedSecond_key" ON "KLine"("tenantId", "market", "lastTradedSecond");
