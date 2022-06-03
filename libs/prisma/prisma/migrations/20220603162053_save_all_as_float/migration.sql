/*
  Warnings:

  - The `volume` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `price` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `locked` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tradedVolume` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `price` column on the `Trade` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `volume` column on the `Trade` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `funds` column on the `Trade` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "volume",
ADD COLUMN     "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "price",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "locked",
ADD COLUMN     "locked" DOUBLE PRECISION DEFAULT 0,
DROP COLUMN "tradedVolume",
ADD COLUMN     "tradedVolume" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "price",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "volume",
ADD COLUMN     "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "funds",
ADD COLUMN     "funds" DOUBLE PRECISION NOT NULL DEFAULT 0;
