/*
  Warnings:

  - You are about to alter the column `bill` on the `Inventory` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `Inventory` MODIFY `bill` JSON NOT NULL;
