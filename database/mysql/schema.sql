-- Database schema for the cart service
CREATE DATABASE IF NOT EXISTS `cart_service`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `cart_service`;

CREATE TABLE IF NOT EXISTS `carts` (
  `id` CHAR(36) NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'USD',
  `discount_code` VARCHAR(64) NULL,
  `discount_percentage` INT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` CHAR(36) NOT NULL,
  `cart_id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `quantity` INT NOT NULL,
  `currency` CHAR(3) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cart_items_cart_id__carts_id`
    FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS `idx_cart_items_cart_id`
  ON `cart_items` (`cart_id`);
