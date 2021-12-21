/*
  Warnings:

  - Added the required column `bill` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Inventory` ADD COLUMN `bill` VARCHAR(191) NOT NULL;
