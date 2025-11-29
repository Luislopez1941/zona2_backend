-- AlterTable
ALTER TABLE `actividades` ADD COLUMN `Publico` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `followers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `follower_runnerUID` CHAR(36) NOT NULL,
    `followed_runnerUID` CHAR(36) NOT NULL,

    UNIQUE INDEX `followers_follower_runnerUID_followed_runnerUID_key`(`follower_runnerUID`, `followed_runnerUID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
