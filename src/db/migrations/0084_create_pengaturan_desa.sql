-- OS-OPS-003: Pengaturan aplikasi terpusat per desa
-- Created: 2026-11-06

CREATE TABLE `pengaturan_desa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `village_id` INT NOT NULL,
  `kunci` VARCHAR(100) NOT NULL,
  `nilai` TEXT,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pengaturan_desa_village` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE,
  CONSTRAINT `pengaturan_desa_village_kunci_uq` UNIQUE (`village_id`, `kunci`)
);
