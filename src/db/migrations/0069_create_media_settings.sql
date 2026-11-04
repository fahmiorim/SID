-- Migration: 0069_create_media_settings.sql

CREATE TABLE `media_settings` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  village_id INT NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  mime_allowlist JSON NULL,
  max_files INT NULL,
  max_size_bytes BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_village_kategori (village_id, kategori),
  INDEX idx_media_settings_village (village_id)
);
