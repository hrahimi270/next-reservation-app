/*
  Warnings:

  - Added the required column `reservedFrom` to the `Resevation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservedTo` to the `Resevation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resevation" ADD COLUMN     "reservedFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "reservedTo" TIMESTAMP(3) NOT NULL;
