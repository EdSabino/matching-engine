-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OPENED', 'FILLED', 'CANCELED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "status" "Status" NOT NULL DEFAULT E'OPENED';
