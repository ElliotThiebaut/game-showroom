/*
  Warnings:

  - The primary key for the `Answers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Answers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Answers_gameQuestion_id_user_id_key";

-- AlterTable
ALTER TABLE "Answers" DROP CONSTRAINT "Answers_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Answers_pkey" PRIMARY KEY ("gameQuestion_id", "user_id");
