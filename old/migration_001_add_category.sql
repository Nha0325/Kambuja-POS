USE ftc_pos;
-- MySQL 5.7 doesn't support ADD COLUMN IF NOT EXISTS; check first
SET @col := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name='products' AND column_name='category');
SET @q := IF(@col = 0, 'ALTER TABLE products ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT "General" AFTER name', 'SELECT 1');
PREPARE s FROM @q; EXECUTE s; DEALLOCATE PREPARE s;
