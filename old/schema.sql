-- Fresh install (idempotent parts)
CREATE DATABASE IF NOT EXISTS ftc_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'ftc_pos_user'@'%' IDENTIFIED BY 'FtC!Pos@2025#KhR';
GRANT ALL PRIVILEGES ON ftc_pos.* TO 'ftc_pos_user'@'%';
FLUSH PRIVILEGES;
USE ftc_pos;

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usd_to_khr INT NOT NULL DEFAULT 4100,
  company_name VARCHAR(150) DEFAULT 'FTC POS'
);
INSERT INTO settings (usd_to_khr, company_name)
SELECT 4100,'FTC POS' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM settings);

CREATE TABLE IF NOT EXISTS floors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS tables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  floor_id INT NOT NULL,
  table_no VARCHAR(50) NOT NULL,
  capacity INT DEFAULT 4,
  status ENUM('free','busy') DEFAULT 'free',
  FOREIGN KEY (floor_id) REFERENCES floors(id)
);

INSERT INTO floors (name) SELECT 'Ground' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM floors);
INSERT INTO floors (name) SELECT '1st Floor' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM floors WHERE name='1st Floor');

INSERT INTO tables (floor_id, table_no, capacity) SELECT 1,'T01',4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_no='T01');
INSERT INTO tables (floor_id, table_no, capacity) SELECT 1,'T02',4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_no='T02');
INSERT INTO tables (floor_id, table_no, capacity) SELECT 1,'T03',4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_no='T03');
INSERT INTO tables (floor_id, table_no, capacity) SELECT 2,'T11',4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_no='T11');
INSERT INTO tables (floor_id, table_no, capacity) SELECT 2,'T12',4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM tables WHERE table_no='T12');

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  price_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
  price_khr INT NOT NULL DEFAULT 0,
  image_path VARCHAR(255),
  stock INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  table_id INT NOT NULL,
  floor_id INT NOT NULL,
  status ENUM('open','paid','void') DEFAULT 'open',
  subtotal_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal_khr INT NOT NULL DEFAULT 0,
  discount_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_khr INT NOT NULL DEFAULT 0,
  total_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_khr INT NOT NULL DEFAULT 0,
  pay_currency ENUM('USD','KHR') DEFAULT 'USD',
  cash_in_usd DECIMAL(12,2) DEFAULT 0,
  cash_in_khr INT DEFAULT 0,
  change_usd DECIMAL(12,2) DEFAULT 0,
  change_khr INT DEFAULT 0,
  usd_to_khr INT NOT NULL,
  paid_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (floor_id) REFERENCES floors(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  price_usd DECIMAL(12,2) NOT NULL,
  price_khr INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  line_total_usd DECIMAL(12,2) NOT NULL,
  line_total_khr INT NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create index on paid_at if it doesn't exist (MySQL 5.7-safe)
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics 
             WHERE table_schema = DATABASE()
             AND table_name = 'invoices' AND index_name = 'idx_invoices_paid_at');
SET @query := IF(@idx = 0, 'CREATE INDEX idx_invoices_paid_at ON invoices(paid_at)', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;
