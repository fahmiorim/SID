-- OS-OPS-004: OTP sebagai faktor kedua saat login
-- Created: 2026-11-06

ALTER TABLE `users` ADD COLUMN `otp_login_aktif` BOOLEAN NOT NULL DEFAULT FALSE;

--> statement-breakpoint

CREATE TABLE `login_otp` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `kanal` VARCHAR(20) NOT NULL,
  `target` VARCHAR(255) NOT NULL,
  `kode_hash` VARCHAR(64) NOT NULL,
  `kedaluwarsa` TIMESTAMP NOT NULL,
  `percobaan` INT NOT NULL DEFAULT 0,
  `terpakai_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_login_otp_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `login_otp_user_idx` (`user_id`)
);
