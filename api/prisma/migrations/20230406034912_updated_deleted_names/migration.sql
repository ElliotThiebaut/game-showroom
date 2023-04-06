/*
  Warnings:

  - You are about to drop the column `deleted` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `GameQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "deleted",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GameQuestion" DROP COLUMN "deleted",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deleted",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
