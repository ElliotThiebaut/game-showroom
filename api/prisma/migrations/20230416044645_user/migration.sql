/*
  Warnings:

  - You are about to drop the column `tutorial` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "tutorial",
ADD COLUMN     "showTutorial" BOOLEAN NOT NULL DEFAULT true;
