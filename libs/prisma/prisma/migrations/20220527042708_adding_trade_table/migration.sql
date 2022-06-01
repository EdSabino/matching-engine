-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "market" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "volume" INTEGER NOT NULL DEFAULT 0,
    "funds" INTEGER NOT NULL DEFAULT 0,
    "makerId" INTEGER NOT NULL,
    "takerId" INTEGER NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_takerId_fkey" FOREIGN KEY ("takerId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
