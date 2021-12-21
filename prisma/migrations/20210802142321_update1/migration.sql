/*
  Warnings:

  - You are about to drop the column `category` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `item_id` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Transactions` table. All the data in the column will be lost.
  - Added the required column `class` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remarks` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Inventory` DROP COLUMN `category`,
    ADD COLUMN `class` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Transactions` DROP COLUMN `item_id`,
    DROP COLUMN `quantity`,
    ADD COLUMN `class` VARCHAR(191) NOT NULL,
    ADD COLUMN `remarks` VARCHAR(191) NOT NULL;
