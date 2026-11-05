-- OS-WGA-010: lapak milik warga
-- Created: 2026-11-05

ALTER TABLE `lapak` ADD COLUMN `resident_id` int;
--> statement-breakpoint
ALTER TABLE `lapak` ADD CONSTRAINT `lapak_resident_id_residents_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`) ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `lapak_village_resident_idx` ON `lapak` (`village_id`,`resident_id`);
