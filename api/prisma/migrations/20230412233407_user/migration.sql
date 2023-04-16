/*
  Warnings:

  - Made the column `clerk_id` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "clerk_id" SET NOT NULL;
