-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "market" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "topBid" DOUBLE PRECISION NOT NULL,
    "lowBid" DOUBLE PRECISION NOT NULL,
    "topAsk" DOUBLE PRECISION NOT NULL,
    "lowAsk" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_tenantId_market_key" ON "Book"("tenantId", "market");
