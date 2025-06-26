-- Course Management System Database Initialization
-- Run this script in phpMyAdmin or MySQL command line

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS course_management 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE course_management;

-- Create users table with enhanced fields
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    profile_picture VARCHAR(200) NULL,
    phone_number VARCHAR(20) NULL,
    date_of_birth DATE NULL,
    student_id VARCHAR(50) NULL UNIQUE,
    department VARCHAR(100) NULL,
    year_of_study INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login DATETIME NULL,
    login_count INT NOT NULL DEFAULT 0,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username),
    INDEX idx_users_student_id (student_id),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create subjects table with enhanced fields
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NULL,
    credits INT NOT NULL DEFAULT 3,
    total_classes INT NOT NULL DEFAULT 0,
    attended_classes INT NOT NULL DEFAULT 0,
    required_attendance INT NOT NULL DEFAULT 80,
    instructor_name VARCHAR(100) NULL,
    instructor_email VARCHAR(120) NULL,
    room_number VARCHAR(20) NULL,
    description TEXT NULL,
    user_id INT NOT NULL,
    is_auto_created BOOLEAN NOT NULL DEFAULT FALSE,
    last_calculated DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subjects_user_id (user_id),
    INDEX idx_subjects_name (name),
    INDEX idx_subjects_code (code),
    INDEX idx_subjects_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create timetable table
CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week VARCHAR(10) NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(20) NULL,
    instructor_name VARCHAR(100) NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_timetable_user_id (user_id),
    INDEX idx_timetable_day (day_of_week),
    INDEX idx_timetable_time (time_slot),
    INDEX idx_timetable_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create academic_calendars table
CREATE TABLE IF NOT EXISTS academic_calendars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester_name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    weekend_days TEXT NOT NULL DEFAULT '[0,6]',
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_academic_calendars_user_id (user_id),
    INDEX idx_academic_calendars_dates (start_date, end_date),
    INDEX idx_academic_calendars_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create holidays table
CREATE TABLE IF NOT EXISTS holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    description TEXT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    calendar_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (calendar_id) REFERENCES academic_calendars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_holidays_calendar_id (calendar_id),
    INDEX idx_holidays_user_id (user_id),
    INDEX idx_holidays_date (date),
    INDEX idx_holidays_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create holiday_periods table
CREATE TABLE IF NOT EXISTS holiday_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'vacation',
    calendar_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (calendar_id) REFERENCES academic_calendars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_holiday_periods_calendar_id (calendar_id),
    INDEX idx_holiday_periods_user_id (user_id),
    INDEX idx_holiday_periods_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(10) NOT NULL,
    notes TEXT NULL,
    marked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_attendance_records_subject_id (subject_id),
    INDEX idx_attendance_records_user_id (user_id),
    INDEX idx_attendance_records_date (date),
    INDEX idx_attendance_records_status (status),
    UNIQUE KEY unique_attendance (subject_id, user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(200) NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    description TEXT NULL,
    tags TEXT NULL,
    upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME NULL,
    access_count INT NOT NULL DEFAULT 0,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notes_subject_id (subject_id),
    INDEX idx_notes_user_id (user_id),
    INDEX idx_notes_file_type (file_type),
    INDEX idx_notes_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert demo user
INSERT IGNORE INTO users (
    username, 
    email, 
    password_hash, 
    full_name, 
    student_id, 
    department, 
    year_of_study
) VALUES (
    'demo',
    'demo@example.com',
    'scrypt:32768:8:1$salt$hash', -- This will be replaced by the application
    'Demo User',
    'DEMO001',
    'Computer Science',
    3
);

-- Create indexes for better performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_subjects_created_at ON subjects(created_at);
CREATE INDEX idx_attendance_records_created_at ON attendance_records(created_at);
CREATE INDEX idx_notes_created_at ON notes(upload_date);

-- Create views for common queries
CREATE OR REPLACE VIEW user_subject_stats AS
SELECT 
    u.id as user_id,
    u.full_name,
    COUNT(s.id) as total_subjects,
    AVG(CASE WHEN s.total_classes > 0 THEN (s.attended_classes / s.total_classes * 100) ELSE 0 END) as avg_attendance,
    SUM(s.total_classes) as total_classes,
    SUM(s.attended_classes) as total_attended
FROM users u
LEFT JOIN subjects s ON u.id = s.user_id AND s.is_active = TRUE
WHERE u.is_active = TRUE
GROUP BY u.id, u.full_name;

-- Create view for attendance summary
CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
    s.id as subject_id,
    s.name as subject_name,
    s.user_id,
    COUNT(ar.id) as total_records,
    SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
    ROUND(
        (SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(ar.id)) * 100, 
        2
    ) as attendance_percentage
FROM subjects s
LEFT JOIN attendance_records ar ON s.id = ar.subject_id
WHERE s.is_active = TRUE
GROUP BY s.id, s.name, s.user_id;

COMMIT;
