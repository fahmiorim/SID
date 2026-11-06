-- OS-OPS-004: TOTP (authenticator app) untuk staf
-- Created: 2026-11-06

ALTER TABLE `users` ADD COLUMN `totp_secret` VARCHAR(255) NULL;

--> statement-breakpoint

CREATE TABLE `totp` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `kode_hash` VARCHAR(64) NOT NULL,
  `kedaluwarsa` TIMESTAMP NOT NULL,
  `percobaan` INT NOT NULL DEFAULT 0,
  `terpakai_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_totp_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `totp_user_idx` (`user_id`)
);