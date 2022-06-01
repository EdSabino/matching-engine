-- DropIndex
DROP INDEX "Order_externalId_idx";

-- CreateIndex
CREATE INDEX "Order_externalId_tenantId_idx" ON "Order"("externalId", "tenantId");
