-- CreateTable
CREATE TABLE "KLine" (
    "tenantId" INTEGER NOT NULL,
    "market" TEXT NOT NULL,
    "openTime" TIMESTAMP(3) NOT NULL,
    "openValue" TEXT NOT NULL,
    "highestValue" TEXT NOT NULL,
    "lowestValue" TEXT NOT NULL,
    "closeValue" TEXT NOT NULL,
    "closeTime" TIMESTAMP(3) NOT NULL,
    "numberTrades" INTEGER NOT NULL
);

-- AddForeignKey
ALTER TABLE "KLine" ADD CONSTRAINT "KLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
