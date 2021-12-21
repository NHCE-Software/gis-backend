-- AddForeignKey
ALTER TABLE `Transactions` ADD FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
