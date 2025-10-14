-- AlterTable
ALTER TABLE `problem` MODIFY `summary` TEXT NOT NULL,
    MODIFY `statement` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `project` MODIFY `description` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `story` MODIFY `body` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `submission` MODIFY `code` LONGTEXT NOT NULL;
