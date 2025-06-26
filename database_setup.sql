-- Run this in phpMyAdmin or MySQL command line to set up the database

-- Create database
CREATE DATABASE IF NOT EXISTS course_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE course_management;

-- The Flask app will create all tables automatically when you run it
-- This file is just to ensure the database exists

-- Optional: Create a user for the application (if you want to use a specific user instead of root)
-- CREATE USER 'course_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON course_management.* TO 'course_user'@'localhost';
-- FLUSH PRIVILEGES;
