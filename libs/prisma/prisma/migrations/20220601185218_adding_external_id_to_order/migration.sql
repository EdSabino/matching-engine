-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "externalId" INTEGER;

-- CreateIndex
CREATE INDEX "Order_externalId_idx" ON "Order"("externalId");
