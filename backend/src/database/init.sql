-- GymSync DB Init
CREATE DATABASE IF NOT EXISTS gymsync_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gymsync_db;
SET time_zone = '-05:00';

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name ENUM('OWNER','ADMIN','RECEPTIONIST','MEMBER') NOT NULL UNIQUE,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gyms (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(300),
  city VARCHAR(100),
  country CHAR(2) DEFAULT 'EC',
  timezone VARCHAR(50) DEFAULT 'America/Guayaquil',
  currency CHAR(3) DEFAULT 'USD',
  grace_days TINYINT UNSIGNED DEFAULT 3,
  logo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  gym_id CHAR(36) NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  email VARCHAR(150),
  pin_hash VARCHAR(255),
  pin_temp BOOLEAN DEFAULT TRUE,
  webauthn_credential JSON,
  status ENUM('ACTIVE','INACTIVE','OVERDUE','FROZEN','CANCELLED') DEFAULT 'INACTIVE',
  avatar_url VARCHAR(500),
  login_attempts TINYINT UNSIGNED DEFAULT 0,
  locked_until TIMESTAMP NULL,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX idx_users_gym (gym_id),
  INDEX idx_users_phone (phone),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS plans (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  gym_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_days INT UNSIGNED NOT NULL DEFAULT 30,
  price DECIMAL(8,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  grace_days TINYINT UNSIGNED DEFAULT 3,
  is_daily BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  INDEX idx_plans_gym (gym_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS memberships (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  plan_id CHAR(36) NOT NULL,
  gym_id CHAR(36) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('ACTIVE','EXPIRED','OVERDUE','FROZEN','CANCELLED') DEFAULT 'ACTIVE',
  frozen_at TIMESTAMP NULL,
  frozen_days INT UNSIGNED DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  INDEX idx_memberships_user (user_id),
  INDEX idx_memberships_status (status),
  INDEX idx_memberships_end (end_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS access_tokens (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  gym_id CHAR(36) NOT NULL,
  token_type ENUM('DAILY_PASS','PICKUP','MONTHLY_PASS') NOT NULL,
  code_4digit CHAR(4) NOT NULL,
  qr_payload TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  INDEX idx_tokens_code (code_4digit, used, expires_at),
  INDEX idx_tokens_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS access_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  gym_id CHAR(36) NOT NULL,
  method ENUM('QR','PIN','BIOMETRIC','MANUAL') NOT NULL,
  result ENUM('GRANTED','DENIED') NOT NULL,
  denied_reason VARCHAR(200),
  token_id CHAR(36),
  device_id VARCHAR(100),
  offline_sync BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  INDEX idx_logs_gym_date (gym_id, created_at),
  INDEX idx_logs_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bank_accounts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  gym_id CHAR(36) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_type ENUM('SAVINGS','CHECKING') DEFAULT 'SAVINGS',
  account_number VARCHAR(30) NOT NULL,
  account_holder VARCHAR(150) NOT NULL,
  id_number VARCHAR(20),
  qr_image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  gym_id CHAR(36) NOT NULL,
  membership_id CHAR(36),
  plan_id CHAR(36),
  amount DECIMAL(8,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  method ENUM('CASH','TRANSFER','CARD') DEFAULT 'TRANSFER',
  status ENUM('PENDING','IN_REVIEW','APPROVED','REJECTED') DEFAULT 'PENDING',
  receipt_url VARCHAR(500),
  ocr_data JSON,
  bank_reference VARCHAR(100),
  bank_account_id CHAR(36),
  approved_by CHAR(36),
  approved_at TIMESTAMP NULL,
  rejected_reason TEXT,
  auto_validated BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  INDEX idx_payments_status (status),
  INDEX idx_payments_user (user_id),
  INDEX idx_payments_gym_date (gym_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  gym_id CHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category ENUM('SUPPLEMENT','CLOTHING','ACCESSORY','OTHER') DEFAULT 'SUPPLEMENT',
  price DECIMAL(8,2) NOT NULL,
  stock INT UNSIGNED DEFAULT 0,
  min_stock INT UNSIGNED DEFAULT 5,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS workout_routines (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  gym_id CHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  duration_weeks TINYINT UNSIGNED DEFAULT 4,
  difficulty ENUM('BEGINNER','INTERMEDIATE','ADVANCED') DEFAULT 'BEGINNER',
  is_active BOOLEAN DEFAULT TRUE,
  created_by CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  gym_id CHAR(36) NOT NULL,
  channel ENUM('WHATSAPP','EMAIL','PUSH') NOT NULL,
  type ENUM('PIN_DELIVERY','PAYMENT_REMINDER','PAYMENT_CONFIRMED','OVERDUE_ALERT','CHURN_ALERT','PROMO','WEEKLY_REPORT','CUSTOM') NOT NULL,
  content TEXT,
  status ENUM('SENT','FAILED','PENDING') DEFAULT 'PENDING',
  sent_at TIMESTAMP NULL,
  error_msg VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_gym_date (gym_id, created_at)
) ENGINE=InnoDB;

-- Seed inicial
INSERT IGNORE INTO roles (name, description) VALUES
  ('OWNER', 'Dueno del gimnasio - acceso total'),
  ('ADMIN', 'Administrador - gestion operativa'),
  ('RECEPTIONIST', 'Recepcion - control de acceso'),
  ('MEMBER', 'Socio - acceso a portal PWA');

INSERT IGNORE INTO gyms (id, name, slug, phone, address, city, country) VALUES
  ('00000000-0000-0000-0000-000000000001', 'GymSync Demo', 'gymsync-demo', '+593999999999', 'Av. Principal 123', 'Calceta', 'EC');

SELECT 'GymSync DB inicializada correctamente' AS resultado;
