/*
  Warnings:

  - You are about to drop the column `date` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `day` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "date",
ADD COLUMN     "day" INTEGER NOT NULL,
ADD COLUMN     "month" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
