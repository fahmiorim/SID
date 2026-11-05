-- OS-OPS-002: Shortcut personal pada beranda
-- Created: 2026-11-06

CREATE TABLE `pengguna_shortcut` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `href` VARCHAR(255) NOT NULL,
  `urut` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pengguna_shortcut_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `pengguna_shortcut_user_href_uq` UNIQUE (`user_id`, `href`)
);
