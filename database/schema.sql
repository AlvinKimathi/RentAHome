-- ====================================================================
-- Rental House Vacancy Finder Management System Database Schema
-- Student: Leon Whitaker | Unit: 3101 - Project | KCA University
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `geta_rental_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `geta_rental_db`;

-- 1. Users Table (Admin, Landlords, Tenants)
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(25) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `role` ENUM('admin', 'landlord', 'tenant') NOT NULL DEFAULT 'tenant',
    `password` VARCHAR(255) NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Houses Table (Property Listings)
CREATE TABLE IF NOT EXISTS `houses` (
    `house_id` INT AUTO_INCREMENT PRIMARY KEY,
    `landlord_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `house_type` VARCHAR(100) NOT NULL, -- e.g., 'Single Room', 'Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom'
    `rent` DECIMAL(10, 2) NOT NULL,
    `deposit` DECIMAL(10, 2) DEFAULT 0.00,
    `description` TEXT NOT NULL,
    `amenities` TEXT DEFAULT NULL, -- Comma-separated or JSON list of amenities (e.g. 'WiFi, Water 24/7, Security Guard, Balcony')
    `status` ENUM('Vacant', 'Occupied') NOT NULL DEFAULT 'Vacant',
    `approval_status` ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'approved',
    `beds` INT DEFAULT 1,
    `baths` INT DEFAULT 1,
    `parking` TINYINT(1) DEFAULT 0,
    `date_posted` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_houses_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. House Images Table (Multiple Photos per House)
CREATE TABLE IF NOT EXISTS `house_images` (
    `image_id` INT AUTO_INCREMENT PRIMARY KEY,
    `house_id` INT NOT NULL,
    `image_path` VARCHAR(500) NOT NULL,
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_images_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bookings / Viewing Requests Table
CREATE TABLE IF NOT EXISTS `bookings` (
    `booking_id` INT AUTO_INCREMENT PRIMARY KEY,
    `house_id` INT NOT NULL,
    `tenant_id` INT NOT NULL,
    `booking_date` DATE NOT NULL,
    `booking_time` VARCHAR(20) DEFAULT '10:00 AM',
    `message` TEXT DEFAULT NULL,
    `status` ENUM('pending', 'confirmed', 'declined', 'completed') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bookings_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bookings_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Password Resets Table
CREATE TABLE IF NOT EXISTS `password_resets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `log_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `user_name` VARCHAR(150) NOT NULL,
    `user_role` VARCHAR(50) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `details` TEXT NOT NULL,
    `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
