-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema tfc_pos
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `tfc_pos` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tfc_pos`;

-- -----------------------------------------------------
-- Table `tfc_pos`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'sale') NOT NULL DEFAULT 'sale',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`business_day`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`business_day` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `open_at` DATETIME NOT NULL,
  `close_at` DATETIME NULL DEFAULT NULL,
  `opened_by` INT NOT NULL,
  `closed_by` INT NULL DEFAULT NULL,
  `is_open` TINYINT(1) NOT NULL DEFAULT '1',
  `note` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`floors`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`floors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`tables`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`tables` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `floor_id` INT NOT NULL,
  `table_no` VARCHAR(50) NOT NULL,
  `capacity` INT NULL DEFAULT '4',
  `status` ENUM('free', 'busy', 'hold', 'disabled') NOT NULL DEFAULT 'free',
  `hold_until` DATETIME NULL DEFAULT NULL,
  `hold_by_user_id` INT NULL DEFAULT NULL,
  `hold_note` VARCHAR(100) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_floor_table` (`floor_id` ASC, `table_no` ASC),
  CONSTRAINT `tables_ibfk_1`
    FOREIGN KEY (`floor_id`)
    REFERENCES `tfc_pos`.`floors` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `category_id` INT NULL DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'General',
  `price_usd` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `price_khr` INT NOT NULL DEFAULT '0',
  `image_path` VARCHAR(255) NULL DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT '0',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_products_category` (`category_id` ASC),
  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`category_id`)
    REFERENCES `tfc_pos`.`categories` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`invoices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`invoices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `table_id` INT NULL DEFAULT NULL,
  `cashier_id` INT NULL DEFAULT NULL,
  `order_type` ENUM('table', 'takeaway') NOT NULL DEFAULT 'table',
  `floor_id` INT NULL DEFAULT NULL,
  `status` ENUM('open', 'paid', 'void') NULL DEFAULT 'open',
  `subtotal_usd` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `subtotal_khr` INT NOT NULL DEFAULT '0',
  `discount_pct` DECIMAL(8,6) NOT NULL DEFAULT '0.000000',
  `discount_amount_usd` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount_khr` INT NOT NULL DEFAULT '0',
  `discount_usd` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `discount_khr` INT NOT NULL DEFAULT '0',
  `total_usd` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `total_khr` INT NOT NULL DEFAULT '0',
  `pay_currency` ENUM('USD', 'KHR') NULL DEFAULT 'USD',
  `pay_method` ENUM('cash', 'qr') NOT NULL DEFAULT 'cash',
  `qr_ref` VARCHAR(64) NULL DEFAULT NULL,
  `cash_in_usd` DECIMAL(12,2) NULL DEFAULT '0.00',
  `cash_in_khr` INT NULL DEFAULT '0',
  `change_usd` DECIMAL(12,2) NULL DEFAULT '0.00',
  `change_khr` INT NULL DEFAULT '0',
  `usd_to_khr` INT NOT NULL,
  `paid_at` DATETIME NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `whole_discount_usd` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `whole_discount_khr` INT NOT NULL DEFAULT '0',
  `use_manual_discount` TINYINT(1) NOT NULL DEFAULT '0',
  `manual_discount_khr` INT NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  INDEX `floor_id` (`floor_id` ASC),
  INDEX `idx_invoices_paid_at` (`paid_at` ASC),
  INDEX `invoices_ibfk_1` (`table_id` ASC),
  CONSTRAINT `invoices_ibfk_1`
    FOREIGN KEY (`table_id`)
    REFERENCES `tfc_pos`.`tables` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `invoices_ibfk_2`
    FOREIGN KEY (`floor_id`)
    REFERENCES `tfc_pos`.`floors` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`invoice_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`invoice_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `invoice_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `price_usd` DECIMAL(12,2) NOT NULL,
  `price_khr` INT NOT NULL,
  `qty` INT NOT NULL DEFAULT '1',
  `line_total_usd` DECIMAL(12,2) NOT NULL,
  `line_total_khr` INT NOT NULL,
  `discount_pct` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  INDEX `invoice_id` (`invoice_id` ASC),
  INDEX `product_id` (`product_id` ASC),
  CONSTRAINT `invoice_items_ibfk_1`
    FOREIGN KEY (`invoice_id`)
    REFERENCES `tfc_pos`.`invoices` (`id`),
  CONSTRAINT `invoice_items_ibfk_2`
    FOREIGN KEY (`product_id`)
    REFERENCES `tfc_pos`.`products` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`business_sessions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`business_sessions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `opened_at` DATETIME NOT NULL,
  `closed_at` DATETIME NULL DEFAULT NULL,
  `opened_by` INT NOT NULL,
  `closed_by` INT NULL DEFAULT NULL,
  `opening_cash_usd` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `opening_cash_khr` INT NOT NULL DEFAULT '0',
  `closing_cash_usd` DECIMAL(12,2) NULL DEFAULT '0.00',
  `closing_cash_khr` INT NULL DEFAULT '0',
  `closing_qr_usd` DECIMAL(12,2) NULL DEFAULT '0.00',
  `closing_qr_khr` INT NULL DEFAULT '0',
  `expected_cash_usd` DECIMAL(12,2) NULL DEFAULT '0.00',
  `expected_cash_khr` INT NULL DEFAULT '0',
  `expected_qr_usd` DECIMAL(12,2) NULL DEFAULT '0.00',
  `expected_qr_khr` INT NULL DEFAULT '0',
  `note` TEXT NULL,
  `status` ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`payments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `pay_currency` ENUM('USD', 'KHR') NOT NULL,
  `total_usd` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `total_khr` INT NOT NULL DEFAULT '0',
  `cash_in_usd` DECIMAL(12,2) NULL DEFAULT NULL,
  `cash_in_khr` INT NULL DEFAULT NULL,
  `change_usd` DECIMAL(12,2) NULL DEFAULT NULL,
  `change_khr` INT NULL DEFAULT NULL,
  `cashier_user_id` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`payment_invoices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`payment_invoices` (
  `payment_id` INT NOT NULL,
  `invoice_id` INT NOT NULL,
  `amount_usd` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `amount_khr` INT NOT NULL DEFAULT '0',
  PRIMARY KEY (`payment_id`, `invoice_id`),
  INDEX `fk_pi_invoice` (`invoice_id` ASC),
  CONSTRAINT `fk_pi_payment`
    FOREIGN KEY (`payment_id`)
    REFERENCES `tfc_pos`.`payments` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_pi_invoice`
    FOREIGN KEY (`invoice_id`)
    REFERENCES `tfc_pos`.`invoices` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`receipt_print_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`receipt_print_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `invoice_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `print_type` ENUM('preorder', 'receipt') NOT NULL,
  `printed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `items_json` LONGTEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_invoice_id` (`invoice_id` ASC),
  INDEX `idx_user_id` (`user_id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`merge_preprint_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`merge_preprint_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL DEFAULT NULL,
  `invoice_ids` VARCHAR(255) NOT NULL,
  `label_text` VARCHAR(255) NOT NULL,
  `total_usd` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `total_khr` INT NOT NULL DEFAULT '0',
  `printed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `tfc_pos`.`settings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tfc_pos`.`settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usd_to_khr` INT NOT NULL DEFAULT '4100',
  `show_exchange_rate` TINYINT(1) NOT NULL DEFAULT '1',
  `company_name` VARCHAR(150) NULL DEFAULT 'TFC POS',
  `company_address` VARCHAR(255) NULL DEFAULT NULL,
  `company_tel` VARCHAR(50) NULL DEFAULT NULL,
  `receipt_title` VARCHAR(50) NULL DEFAULT NULL,
  `receipt_logo` VARCHAR(255) NULL DEFAULT NULL,
  `qr_code_path` VARCHAR(255) NULL DEFAULT NULL,
  `wifi_password` VARCHAR(64) NULL DEFAULT NULL,
  `receipt_footer_kh` VARCHAR(120) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;