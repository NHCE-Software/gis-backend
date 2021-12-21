/*
  Warnings:

  - Made the column `title` on table `Transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Transactions` MODIFY `title` VARCHAR(191) NOT NULL;
