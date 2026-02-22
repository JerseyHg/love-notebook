-- ============================================
-- Migration: add_diary_coupleId_timeline_author
-- ============================================

-- 1. Diary 表新增 coupleId 字段
ALTER TABLE `Diary` ADD COLUMN `coupleId` VARCHAR(191) NULL;

-- 2. 回填现有数据：从 author -> user.coupleId 复制
UPDATE `Diary` d
  JOIN `User` u ON d.authorId = u.id
  SET d.coupleId = u.coupleId
  WHERE d.coupleId IS NULL AND u.coupleId IS NOT NULL;

-- 3. 添加索引和外键
CREATE INDEX `Diary_coupleId_idx` ON `Diary`(`coupleId`);
ALTER TABLE `Diary` ADD CONSTRAINT `Diary_coupleId_fkey`
  FOREIGN KEY (`coupleId`) REFERENCES `Couple`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Timeline 表新增 author 外键（authorId 字段已存在，只缺外键和索引）
CREATE INDEX `Timeline_authorId_idx` ON `Timeline`(`authorId`);
ALTER TABLE `Timeline` ADD CONSTRAINT `Timeline_authorId_fkey`
  FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
