-- OS-OPS-008: Registri status plugin integrasi (manifest build-time)
-- Created: 2026-11-06

CREATE TABLE `plugin_registry` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `village_id` INT NOT NULL,
  `slug` VARCHAR(80) NOT NULL,
  `aktif` BOOLEAN NOT NULL DEFAULT FALSE,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_plugin_registry_village` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE,
  CONSTRAINT `plugin_registry_village_slug_uq` UNIQUE (`village_id`, `slug`)
);
