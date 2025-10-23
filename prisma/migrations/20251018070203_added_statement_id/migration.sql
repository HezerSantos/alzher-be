/*
  Warnings:

  - Added the required column `statementId` to the `Statements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Statements" ADD COLUMN     "statementId" TEXT NOT NULL;
