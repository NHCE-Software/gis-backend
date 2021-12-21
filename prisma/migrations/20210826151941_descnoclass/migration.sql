/*
  Warnings:

  - You are about to drop the column `remarks` on the `Transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Transactions` DROP COLUMN `remarks`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `class` VARCHAR(191);
