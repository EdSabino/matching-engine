/*
  Warnings:

  - Added the required column `tradedVolume` to the `KLine` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `openValue` on the `KLine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `highestValue` on the `KLine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `lowestValue` on the `KLine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `closeValue` on the `KLine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "KLine" ADD COLUMN     "tradedVolume" DOUBLE PRECISION NOT NULL,
DROP COLUMN "openValue",
ADD COLUMN     "openValue" DOUBLE PRECISION NOT NULL,
DROP COLUMN "highestValue",
ADD COLUMN     "highestValue" DOUBLE PRECISION NOT NULL,
DROP COLUMN "lowestValue",
ADD COLUMN     "lowestValue" DOUBLE PRECISION NOT NULL,
DROP COLUMN "closeValue",
ADD COLUMN     "closeValue" DOUBLE PRECISION NOT NULL;
